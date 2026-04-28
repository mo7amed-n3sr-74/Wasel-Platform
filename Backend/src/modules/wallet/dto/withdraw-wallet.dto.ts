import { IsNotEmpty, IsString, IsObject, IsDecimal } from 'class-validator';

export class WithdrawWalletDTO {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '1,4' })
  amount: string;

  @IsNotEmpty()
  @IsObject()
  bankAccount: {
    accountNumber: string;
    bankCode: string;
    accountHolder: string;
    bankName?: string;
  };
}
