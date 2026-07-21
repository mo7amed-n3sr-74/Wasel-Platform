import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
