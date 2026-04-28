import { IsNotEmpty, IsString } from 'class-validator';

export class AddTruckDto {
    @IsNotEmpty()
    @IsString()
    truck_num: string;

    @IsNotEmpty()
    @IsString()
    truck_type: string;

    @IsNotEmpty()
    @IsString()
    truck_model: string;
}
