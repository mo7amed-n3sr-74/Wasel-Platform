import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class RechargeWalletDTO {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '1,4' })
  amount: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // e.g., "card", "bank_transfer"

  @IsNotEmpty()
  @IsString()
  externalTransactionId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
