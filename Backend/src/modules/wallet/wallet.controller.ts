import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RechargeWalletDTO } from './dto/recharge-wallet.dto';
import { WithdrawWalletDTO } from './dto/withdraw-wallet.dto';
import { PayForShipmentDTO } from './dto/pay-for-shipment.dto';
import { AuthGuard } from '@/common/guards/jwtAuthGuard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard)
  @Get(':walletId')
  async getWallet(@Param('walletId') walletId: string) {
    const wallet = await this.walletService.getWallet(walletId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wallet retrieved successfully',
      data: wallet,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':walletId/balance')
  async getBalance(@Param('walletId') walletId: string) {
    const balance = await this.walletService.getBalance(walletId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Balance retrieved successfully',
      data: { balance },
    };
  }

  @Get(':walletId/transactions')
  async getTransactionHistory(
    @Param('walletId') walletId: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const { transactions, total } =
      await this.walletService.getTransactionHistory(
        walletId,
        parseInt(limit),
        parseInt(offset),
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  }

  @Post('recharge')
  async recharge(@Body() dto: RechargeWalletDTO) {
    const { wallet, transaction } = await this.walletService.recharge(
      dto.walletId,
      dto.amount,
      dto.paymentMethod,
      dto.externalTransactionId,
      dto.description,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Wallet recharged successfully',
      data: { wallet, transaction },
    };
  }

  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawWalletDTO) {
    const { withdrawal, transaction } = await this.walletService.withdraw(
      dto.walletId,
      dto.amount,
      dto.bankAccount,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Withdrawal initiated successfully',
      data: { withdrawal, transaction },
    };
  }

  @Post('pay-shipment')
  async payForShipment(@Body() dto: PayForShipmentDTO) {
    const { shipmentPayment, transaction } =
      await this.walletService.payForShipment(
        dto.walletId,
        dto.shipmentId,
        dto.amount,
      );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Shipment payment processed successfully',
      data: { shipmentPayment, transaction },
    };
  }

  @Post('withdrawals/:withdrawalId/mark-processed')
  async markWithdrawalAsProcessed(@Param('withdrawalId') withdrawalId: string) {
    const withdrawal =
      await this.walletService.markWithdrawalAsProcessed(withdrawalId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Withdrawal marked as processed',
      data: { withdrawal },
    };
  }
}
