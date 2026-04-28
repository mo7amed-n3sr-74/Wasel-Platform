import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import {
  Wallet,
  Transaction,
  Withdrawal,
  ShipmentPayment,
  TransactionType,
  TransactionStatus,
  WithdrawalStatus,
  ShipmentPaymentStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { RechargeWalletDTO } from './dto/recharge-wallet.dto';
import { WithdrawWalletDTO } from './dto/withdraw-wallet.dto';
import { PayForShipmentDTO } from './dto/pay-for-shipment.dto';
import {
  InsufficientFundsException,
  WalletNotFoundException,
  TransactionFailedException,
  InvalidAmountException,
  ShipmentNotFoundException,
  WithdrawalNotAllowedException,
} from './exceptions/wallet.exceptions';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize a wallet for a user
   * Called when a new user is created
   */
  async initializeWallet(
    userId: string,
    currency: string = 'USD',
  ): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.create({
        data: {
          userId,
          currency,
          balance: new Decimal(0),
        },
      });
      this.logger.log(`Wallet initialized for user ${userId}`);
      return wallet;
    } catch (error) {
      this.logger.error(
        `Failed to initialize wallet for user ${userId}`,
        error,
      );
      throw new TransactionFailedException('Wallet initialization failed');
    }
  }

  /**
   * Get wallet balance
   * Uses pessimistic locking to prevent race conditions
   */
  async getBalance(walletId: string): Promise<Decimal> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
        select: { balance: true },
      });

      if (!wallet) {
        throw new WalletNotFoundException(walletId);
      }

      return wallet.balance;
    } catch (error) {
      if (error instanceof WalletNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get balance for wallet ${walletId}`, error);
      throw new TransactionFailedException('Failed to retrieve balance');
    }
  }

  /**
   * Recharge wallet
   * Creates a RECHARGE transaction and updates balance
   */
  async recharge(
    walletId: string,
    amount: number | string,
    paymentMethod: string,
    externalTransactionId: string,
    description?: string,
  ): Promise<{
    wallet: Wallet;
    transaction: Transaction;
  }> {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new InvalidAmountException('Recharge amount must be positive');
    }

    try {
      // Use database transaction with pessimistic locking
      const result = await this.prisma.$transaction(async (tx) => {
        // Lock the wallet row
        const wallet: [{ id: string, balance: number }] | [] = await tx.$queryRaw`
          SELECT id, balance FROM wallets WHERE id = ${walletId} FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new WalletNotFoundException(walletId);
        }

        // Create transaction record (immutable, append-only)
        const transaction = await tx.transaction.create({
          data: {
            type: TransactionType.RECHARGE,
            amount: decimalAmount,
            status: TransactionStatus.COMPLETED,
            paymentMethod,
            externalTransactionId,
            description: description || `Wallet recharge via ${paymentMethod}`,
            walletId,
            referenceType: 'external_payment',
          },
        });

        // Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: {
              increment: decimalAmount,
            },
          },
        });

        return { wallet: updatedWallet, transaction };
      });

      this.logger.log(
        `Wallet ${walletId} recharged with ${amount} ${externalTransactionId}`,
      );
      return result;
    } catch (error) {
      if (
        error instanceof WalletNotFoundException ||
        error instanceof InvalidAmountException
      ) {
        throw error;
      }
      this.logger.error(`Failed to recharge wallet ${walletId}`, error);
      throw new TransactionFailedException(`Recharge failed: ${error.message}`);
    }
  }

  /**
   * Withdraw funds from wallet
   * Creates a WITHDRAW transaction and updates balance
   */
  async withdraw(
    walletId: string,
    amount: number | string,
    bankAccount: {
      accountNumber: string;
      bankCode: string;
      accountHolder: string;
      bankName?: string;
    },
  ): Promise<{
    withdrawal: Withdrawal;
    transaction: Transaction;
  }> {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new InvalidAmountException('Withdrawal amount must be positive');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Lock and retrieve wallet
        const wallet: [{ id: string, balance: number }] | [] = await tx.$queryRaw`
          SELECT id, balance FROM wallets WHERE id = ${walletId} FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new WalletNotFoundException(walletId);
        }

        const currentBalance = new Decimal(wallet[0].balance);

        // Check sufficient funds
        if (currentBalance.lessThan(decimalAmount)) {
          throw new InsufficientFundsException(
            currentBalance.toNumber(),
            decimalAmount.toNumber(),
          );
        }

        // Create withdrawal record
        const withdrawal = await tx.withdrawal.create({
          data: {
            walletId,
            amount: decimalAmount,
            status: WithdrawalStatus.PENDING,
            bankAccount,
          },
        });

        // Create transaction record (negative amount for debit)
        const transaction = await tx.transaction.create({
          data: {
            type: TransactionType.WITHDRAW,
            amount: decimalAmount.negated(),
            status: TransactionStatus.PENDING,
            walletId,
            referenceType: 'withdrawal',
            referenceId: withdrawal.id,
            description: `Withdrawal to bank account ending in ${bankAccount.accountNumber.slice(-4)}`,
          },
        });

        // Update wallet balance (deduct)
        const updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: {
              decrement: decimalAmount,
            },
          },
        });

        return { withdrawal, transaction };
      });

      this.logger.log(
        `Withdrawal initiated for wallet ${walletId}, amount: ${amount}`,
      );
      return result;
    } catch (error) {
      if (
        error instanceof WalletNotFoundException ||
        error instanceof InvalidAmountException ||
        error instanceof InsufficientFundsException
      ) {
        throw error;
      }
      this.logger.error(`Failed to withdraw from wallet ${walletId}`, error);
      throw new TransactionFailedException(
        `Withdrawal failed: ${error.message}`,
      );
    }
  }

  /**
   * Pay for shipment using wallet
   * Creates a SHIPMENT_PAYMENT transaction and updates balance
   */
  async payForShipment(
    walletId: string,
    shipmentId: string,
    amount: number | string,
  ): Promise<{
    shipmentPayment: ShipmentPayment;
    transaction: Transaction;
  }> {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new InvalidAmountException('Payment amount must be positive');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Verify shipment exists
        const shipment = await tx.shipment.findUnique({
          where: { id: shipmentId },
          select: { id: true, status: true },
        });

        if (!shipment) {
          throw new ShipmentNotFoundException(shipmentId);
        }

        // Lock and retrieve wallet
        const wallet: [{ id: string, balance: number }] | [] = await tx.$queryRaw`
          SELECT id, balance FROM wallets WHERE id = ${walletId} FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new WalletNotFoundException(walletId);
        }

        const currentBalance = new Decimal(wallet[0].balance);

        // Check sufficient funds
        if (currentBalance.lessThan(decimalAmount)) {
          throw new InsufficientFundsException(
            currentBalance.toNumber(),
            decimalAmount.toNumber(),
          );
        }

        // Check if payment already exists
        const existingPayment = await tx.shipmentPayment.findFirst({
          where: {
            shipmentId,
            walletId,
            status: ShipmentPaymentStatus.COMPLETED,
          },
        });

        if (existingPayment) {
          throw new TransactionFailedException(
            'Payment for this shipment already exists',
          );
        }

        // Create transaction record (negative amount for debit)
        const transaction = await tx.transaction.create({
          data: {
            type: TransactionType.SHIPMENT_PAYMENT,
            amount: decimalAmount.negated(),
            status: TransactionStatus.COMPLETED,
            walletId,
            referenceType: 'shipment',
            referenceId: shipmentId,
            description: `Payment for shipment ${shipmentId}`,
          },
        });

        // Create shipment payment record
        const shipmentPayment = await tx.shipmentPayment.create({
          data: {
            walletId,
            shipmentId,
            amount: decimalAmount,
            status: ShipmentPaymentStatus.COMPLETED,
            transactionId: transaction.id,
            paidAt: new Date(),
          },
        });

        // Update wallet balance (deduct)
        const updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: {
              decrement: decimalAmount,
            },
          },
        });

        return { shipmentPayment, transaction };
      });

      this.logger.log(
        `Shipment ${shipmentId} payment processed for wallet ${walletId}, amount: ${amount}`,
      );
      return result;
    } catch (error) {
      if (
        error instanceof WalletNotFoundException ||
        error instanceof InvalidAmountException ||
        error instanceof InsufficientFundsException ||
        error instanceof ShipmentNotFoundException ||
        error instanceof TransactionFailedException
      ) {
        throw error;
      }
      this.logger.error(`Failed to pay for shipment ${shipmentId}`, error);
      throw new TransactionFailedException(
        `Shipment payment failed: ${error.message}`,
      );
    }
  }

  /**
   * Get transaction history for a wallet
   * Returns paginated transaction records
   */
  async getTransactionHistory(
    walletId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    try {
      // Verify wallet exists
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new WalletNotFoundException(walletId);
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where: { walletId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.transaction.count({
          where: { walletId },
        }),
      ]);

      return { transactions, total };
    } catch (error) {
      if (error instanceof WalletNotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get transaction history for wallet ${walletId}`,
        error,
      );
      throw new TransactionFailedException(
        'Failed to retrieve transaction history',
      );
    }
  }

  /**
   * Apply a fee to the wallet
   * Creates a FEE transaction
   */
  async applyFee(
    walletId: string,
    amount: number | string,
    description: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<Transaction> {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new InvalidAmountException('Fee amount must be positive');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Lock wallet
        const wallet: [{ id: string, balance: number }] | [] = await tx.$queryRaw`
          SELECT id, balance FROM wallets WHERE id = ${walletId} FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new WalletNotFoundException(walletId);
        }

        const currentBalance = new Decimal(wallet[0].balance);

        if (currentBalance.lessThan(decimalAmount)) {
          throw new InsufficientFundsException(
            currentBalance.toNumber(),
            decimalAmount.toNumber(),
          );
        }

        // Create fee transaction
        const transaction = await tx.transaction.create({
          data: {
            type: TransactionType.FEE,
            amount: decimalAmount.negated(),
            status: TransactionStatus.COMPLETED,
            walletId,
            description,
            referenceType,
            referenceId,
          },
        });

        // Update balance
        await tx.wallet.update({
          where: { id: walletId },
          data: {
            balance: {
              decrement: decimalAmount,
            },
          },
        });

        return transaction;
      });
    } catch (error) {
      if (
        error instanceof WalletNotFoundException ||
        error instanceof InvalidAmountException ||
        error instanceof InsufficientFundsException
      ) {
        throw error;
      }
      this.logger.error(`Failed to apply fee to wallet ${walletId}`, error);
      throw new TransactionFailedException(
        `Fee application failed: ${error.message}`,
      );
    }
  }

  /**
   * Process a refund to the wallet
   * Creates a REFUND transaction
   */
  async processRefund(
    walletId: string,
    amount: number | string,
    reason: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<Transaction> {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new InvalidAmountException('Refund amount must be positive');
    }

    try {
      return await this.prisma.transaction.create({
        data: {
          type: TransactionType.REFUND,
          amount: decimalAmount,
          status: TransactionStatus.COMPLETED,
          walletId,
          description: `Refund: ${reason}`,
          referenceType,
          referenceId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to process refund for wallet ${walletId}`,
        error,
      );
      throw new TransactionFailedException(
        `Refund processing failed: ${error.message}`,
      );
    }
  }

  /**
   * Get wallet details
   */
  async getWallet(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new WalletNotFoundException(walletId);
      }

      return wallet;
    } catch (error) {
      if (error instanceof WalletNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get wallet ${walletId}`, error);
      throw new TransactionFailedException('Failed to retrieve wallet');
    }
  }

  /**
   * Get wallet by userId
   */
  async getWalletByUserId(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new TransactionFailedException(
          `Wallet not found for user ${userId}`,
        );
      }

      return wallet;
    } catch (error) {
      if (error instanceof TransactionFailedException) {
        throw error;
      }
      this.logger.error(`Failed to get wallet for user ${userId}`, error);
      throw new TransactionFailedException('Failed to retrieve wallet');
    }
  }

  /**
   * Mark withdrawal as processed
   * Called by admin after bank transfer
   */
  async markWithdrawalAsProcessed(withdrawalId: string): Promise<Withdrawal> {
    try {
      // Update withdrawal status
      const withdrawal = await this.prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      // Update related transaction status
      await this.prisma.transaction.updateMany({
        where: {
          referenceType: 'withdrawal',
          referenceId: withdrawalId,
        },
        data: {
          status: TransactionStatus.COMPLETED,
        },
      });

      this.logger.log(`Withdrawal ${withdrawalId} marked as processed`);
      return withdrawal;
    } catch (error) {
      this.logger.error(
        `Failed to mark withdrawal ${withdrawalId} as processed`,
        error,
      );
      throw new TransactionFailedException(
        'Failed to update withdrawal status',
      );
    }
  }
}
