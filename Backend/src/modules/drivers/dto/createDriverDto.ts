import { IsNotEmpty, IsString, IsInt, Min, Max, IsNumber } from 'class-validator';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  national_id: string;
  
  @IsNotEmpty()
  @IsString()
  phone: string;
}
