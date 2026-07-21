import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RechargeWalletDTO } from './dto/recharge-wallet.dto';
import { WithdrawWalletDTO } from './dto/withdraw-wallet.dto';
import { PayForShipmentDTO } from './dto/pay-for-shipment.dto';
import { AuthGuard } from '@/common/guards/jwtAuthGuard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // @UseGuards(AuthGuard)
  // @Get(':walletId')
  // async getWallet(@Param('walletId') walletId: string) {
  //   const wallet = await this.walletService.getWallet(walletId);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'Wallet retrieved successfully',
  //     data: wallet,
  //   };
  // }

  @UseGuards(AuthGuard)
  @Get('balance')
  async getBalance(@Req() req: Request) {
    const balance = await this.walletService.getBalance(req);
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

  @Post('recharge/stripe/create-intent')
  async createRechargeIntent(
    @Body() body: { walletId: string; amount: number; currency?: string },
  ) {
    const result = await this.walletService.createRechargeIntent(
      body.walletId,
      body.amount,
      body.currency,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Stripe payment intent created',
      data: result,
    };
  }

  @Post('recharge/paypal/create-order')
  async createPayPalRechargeOrder(
    @Body() body: { walletId: string; amount: number; currency?: string },
  ) {
    const result = await this.walletService.createPayPalRechargeOrder(
      body.walletId,
      body.amount,
      body.currency,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'PayPal order created',
      data: result,
    };
  }

  @Post('recharge/confirm')
  async confirmRecharge(@Body() body: {
    walletId: string;
    amount: number;
    paymentMethod: string;
    externalTransactionId: string;
    description?: string;
  }) {
    const { wallet, transaction } = await this.walletService.confirmRecharge(
      body.walletId,
      body.amount,
      body.paymentMethod,
      body.externalTransactionId,
      body.description,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Wallet recharged successfully',
      data: { wallet, transaction },
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

  @Post('pay-shipment/stripe/create-intent')
  async createShipmentPaymentIntent(
    @Body() body: { walletId: string; shipmentId: string; amount: number; currency?: string },
  ) {
    const result = await this.walletService.createShipmentPaymentIntent(
      body.walletId,
      body.shipmentId,
      body.amount,
      body.currency,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Stripe payment intent created for shipment',
      data: result,
    };
  }

  @Post('pay-shipment/paypal/create-order')
  async createShipmentPayPalOrder(
    @Body() body: { walletId: string; shipmentId: string; amount: number; currency?: string },
  ) {
    const result = await this.walletService.createShipmentPayPalOrder(
      body.walletId,
      body.shipmentId,
      body.amount,
      body.currency,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'PayPal order created for shipment',
      data: result,
    };
  }

  @Post('pay-shipment/confirm')
  async confirmShipmentPayment(@Body() body: {
    walletId: string;
    shipmentId: string;
    amount: number;
    paymentMethod: string;
    externalTransactionId: string;
  }) {
    const { shipmentPayment, transaction } =
      await this.walletService.confirmShipmentPayment(
        body.walletId,
        body.shipmentId,
        body.amount,
        body.paymentMethod,
        body.externalTransactionId,
      );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Shipment payment processed successfully',
      data: { shipmentPayment, transaction },
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
