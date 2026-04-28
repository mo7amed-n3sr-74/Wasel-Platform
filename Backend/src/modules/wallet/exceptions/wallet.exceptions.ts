import { HttpException, HttpStatus } from '@nestjs/common';

export enum WalletErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  SHIPMENT_NOT_FOUND = 'SHIPMENT_NOT_FOUND',
  WITHDRAWAL_NOT_ALLOWED = 'WITHDRAWAL_NOT_ALLOWED',
  CONCURRENT_TRANSACTION = 'CONCURRENT_TRANSACTION',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
}

export class InsufficientFundsException extends HttpException {
  constructor(availableBalance: number, requiredAmount: number) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: WalletErrorCode.INSUFFICIENT_FUNDS,
        message: `Insufficient funds. Available: ${availableBalance}, Required: ${requiredAmount}`,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

export class WalletNotFoundException extends HttpException {
  constructor(walletId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: WalletErrorCode.WALLET_NOT_FOUND,
        message: `Wallet with ID ${walletId} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class TransactionFailedException extends HttpException {
  constructor(reason: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: WalletErrorCode.TRANSACTION_FAILED,
        message: `Transaction failed: ${reason}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidAmountException extends HttpException {
  constructor(message: string = 'Invalid amount provided') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: WalletErrorCode.INVALID_AMOUNT,
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ShipmentNotFoundException extends HttpException {
  constructor(shipmentId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: WalletErrorCode.SHIPMENT_NOT_FOUND,
        message: `Shipment with ID ${shipmentId} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class WithdrawalNotAllowedException extends HttpException {
  constructor(reason: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: WalletErrorCode.WITHDRAWAL_NOT_ALLOWED,
        message: `Withdrawal not allowed: ${reason}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
