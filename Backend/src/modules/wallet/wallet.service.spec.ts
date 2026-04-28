import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Decimal } from '@prisma/client';
import {
  InsufficientFundsException,
  WalletNotFoundException,
  InvalidAmountException,
  TransactionFailedException,
  ShipmentNotFoundException,
} from './exceptions/wallet.exceptions';

describe('WalletService', () => {
  let service: WalletService;
  let prismaService: PrismaService;

  const mockWallet = {
    id: 'wallet_123',
    userId: 'user_123',
    balance: new Decimal('1000.00'),
    currency: 'USD',
    updatedAt: new Date(),
  };

  const mockTransaction = {
    id: 'txn_123',
    walletId: 'wallet_123',
    type: 'RECHARGE',
    amount: new Decimal('500.00'),
    status: 'COMPLETED',
    referenceType: null,
    referenceId: null,
    description: 'Test recharge',
    paymentMethod: 'credit_card',
    externalTransactionId: 'ext_123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            transaction: {
              findMany: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
              updateMany: jest.fn(),
            },
            shipment: {
              findUnique: jest.fn(),
            },
            withdrawal: {
              create: jest.fn(),
              update: jest.fn(),
            },
            shipmentPayment: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      jest
        .spyOn(prismaService.wallet, 'findUnique')
        .mockResolvedValue(mockWallet);

      const balance = await service.getBalance('wallet_123');

      expect(balance).toEqual(new Decimal('1000.00'));
      expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: { id: 'wallet_123' },
        select: { balance: true },
      });
    });

    it('should throw WalletNotFoundException if wallet not found', async () => {
      jest.spyOn(prismaService.wallet, 'findUnique').mockResolvedValue(null);

      await expect(service.getBalance('invalid_wallet')).rejects.toThrow(
        WalletNotFoundException,
      );
    });
  });

  describe('recharge', () => {
    it('should successfully recharge wallet', async () => {
      const mockTxResult = {
        wallet: mockWallet,
        transaction: mockTransaction,
      };

      jest.spyOn(prismaService, '$transaction').mockResolvedValue(mockTxResult);

      const result = await service.recharge(
        'wallet_123',
        '500.00',
        'credit_card',
        'ext_123',
        'Test recharge',
      );

      expect(result.wallet.balance).toEqual(new Decimal('1000.00'));
      expect(result.transaction.type).toBe('RECHARGE');
    });

    it('should throw InvalidAmountException for negative amount', async () => {
      await expect(
        service.recharge('wallet_123', '-100', 'credit_card', 'ext_123'),
      ).rejects.toThrow(InvalidAmountException);
    });

    it('should throw InvalidAmountException for zero amount', async () => {
      await expect(
        service.recharge('wallet_123', '0', 'credit_card', 'ext_123'),
      ).rejects.toThrow(InvalidAmountException);
    });
  });

  describe('withdraw', () => {
    it('should successfully initiate withdrawal', async () => {
      const mockWithdrawal = {
        id: 'withdraw_123',
        walletId: 'wallet_123',
        amount: new Decimal('100.00'),
        status: 'PENDING',
        bankAccount: {
          accountNumber: '1234567890',
          bankCode: 'CBEG',
          accountHolder: 'John Doe',
        },
        processedAt: null,
        createdAt: new Date(),
      };

      const mockTxResult = {
        withdrawal: mockWithdrawal,
        transaction: {
          ...mockTransaction,
          type: 'WITHDRAW',
          amount: new Decimal('-100.00'),
        },
      };

      jest.spyOn(prismaService, '$transaction').mockResolvedValue(mockTxResult);

      const result = await service.withdraw('wallet_123', '100.00', {
        accountNumber: '1234567890',
        bankCode: 'CBEG',
        accountHolder: 'John Doe',
      });

      expect(result.withdrawal.status).toBe('PENDING');
      expect(result.transaction.amount).toEqual(new Decimal('-100.00'));
    });

    it('should throw InsufficientFundsException if balance is insufficient', async () => {
      const mockTxError = new InsufficientFundsException(100, 1000);
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(mockTxError);

      await expect(
        service.withdraw('wallet_123', '1000.00', {
          accountNumber: '1234567890',
          bankCode: 'CBEG',
          accountHolder: 'John Doe',
        }),
      ).rejects.toThrow(InsufficientFundsException);
    });

    it('should throw InvalidAmountException for negative amount', async () => {
      await expect(
        service.withdraw('wallet_123', '-100', {
          accountNumber: '1234567890',
          bankCode: 'CBEG',
          accountHolder: 'John Doe',
        }),
      ).rejects.toThrow(InvalidAmountException);
    });
  });

  describe('payForShipment', () => {
    it('should successfully process shipment payment', async () => {
      const mockShipmentPayment = {
        id: 'sp_123',
        shipmentId: 'shipment_456',
        walletId: 'wallet_123',
        amount: new Decimal('250.00'),
        status: 'COMPLETED',
        transactionId: 'txn_123',
        paidAt: new Date(),
        createdAt: new Date(),
      };

      const mockTxResult = {
        shipmentPayment: mockShipmentPayment,
        transaction: {
          ...mockTransaction,
          type: 'SHIPMENT_PAYMENT',
          amount: new Decimal('-250.00'),
        },
      };

      jest.spyOn(prismaService, '$transaction').mockResolvedValue(mockTxResult);

      const result = await service.payForShipment(
        'wallet_123',
        'shipment_456',
        '250.00',
      );

      expect(result.shipmentPayment.status).toBe('COMPLETED');
      expect(result.shipmentPayment.paidAt).toBeDefined();
    });

    it('should throw ShipmentNotFoundException if shipment not found', async () => {
      const mockTxError = new ShipmentNotFoundException('invalid_shipment');
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(mockTxError);

      await expect(
        service.payForShipment('wallet_123', 'invalid_shipment', '250.00'),
      ).rejects.toThrow(ShipmentNotFoundException);
    });

    it('should throw InsufficientFundsException if balance insufficient', async () => {
      const mockTxError = new InsufficientFundsException(100, 1000);
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(mockTxError);

      await expect(
        service.payForShipment('wallet_123', 'shipment_456', '1000.00'),
      ).rejects.toThrow(InsufficientFundsException);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history with pagination', async () => {
      const mockTransactions = [mockTransaction];
      jest
        .spyOn(prismaService.wallet, 'findUnique')
        .mockResolvedValue(mockWallet);
      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(mockTransactions);
      jest.spyOn(prismaService.transaction, 'count').mockResolvedValue(1);

      const result = await service.getTransactionHistory('wallet_123', 20, 0);

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.transactions[0].type).toBe('RECHARGE');
    });

    it('should throw WalletNotFoundException if wallet not found', async () => {
      jest.spyOn(prismaService.wallet, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getTransactionHistory('invalid_wallet'),
      ).rejects.toThrow(WalletNotFoundException);
    });
  });

  describe('initializeWallet', () => {
    it('should create a new wallet for user', async () => {
      jest.spyOn(prismaService.wallet, 'create').mockResolvedValue(mockWallet);

      const result = await service.initializeWallet('user_123', 'USD');

      expect(result.balance).toEqual(new Decimal('0'));
      expect(result.userId).toBe('user_123');
    });
  });

  describe('applyFee', () => {
    it('should apply fee and deduct from balance', async () => {
      const mockFeeTransaction = {
        ...mockTransaction,
        type: 'FEE',
        amount: new Decimal('-10.00'),
      };

      jest
        .spyOn(prismaService, '$transaction')
        .mockResolvedValue(mockFeeTransaction);

      const result = await service.applyFee(
        'wallet_123',
        '10.00',
        'Platform fee',
      );

      expect(result.type).toBe('FEE');
      expect(result.amount).toEqual(new Decimal('-10.00'));
    });

    it('should throw InsufficientFundsException if balance insufficient', async () => {
      const mockTxError = new InsufficientFundsException(5, 10);
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(mockTxError);

      await expect(
        service.applyFee('wallet_123', '10.00', 'Platform fee'),
      ).rejects.toThrow(InsufficientFundsException);
    });
  });

  describe('processRefund', () => {
    it('should process refund and credit wallet', async () => {
      const mockRefundTransaction = {
        ...mockTransaction,
        type: 'REFUND',
        amount: new Decimal('250.00'),
      };

      jest
        .spyOn(prismaService.transaction, 'create')
        .mockResolvedValue(mockRefundTransaction);

      const result = await service.processRefund(
        'wallet_123',
        '250.00',
        'Shipment cancelled',
      );

      expect(result.type).toBe('REFUND');
      expect(result.amount).toEqual(new Decimal('250.00'));
    });
  });

  describe('markWithdrawalAsProcessed', () => {
    it('should update withdrawal status to COMPLETED', async () => {
      const mockWithdrawal = {
        id: 'withdraw_123',
        walletId: 'wallet_123',
        amount: new Decimal('100.00'),
        status: 'COMPLETED',
        bankAccount: { accountNumber: '1234567890', bankCode: 'CBEG' },
        processedAt: new Date(),
        createdAt: new Date(),
      };

      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(mockWithdrawal);
      jest
        .spyOn(prismaService.transaction, 'updateMany')
        .mockResolvedValue({ count: 1 });

      const result = await service.markWithdrawalAsProcessed('withdraw_123');

      expect(result.status).toBe('COMPLETED');
      expect(result.processedAt).toBeDefined();
    });
  });
});
