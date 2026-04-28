import { IsNotEmpty, IsString, IsDecimal } from 'class-validator';

export class PayForShipmentDTO {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsString()
  shipmentId: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '1,4' })
  amount: string;
}
