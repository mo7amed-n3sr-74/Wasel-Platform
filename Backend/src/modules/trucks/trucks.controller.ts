import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
} from '@nestjs/common';
import { TrucksService } from './trucks.service';
import { AuthGuard } from '@/common/guards/jwtAuthGuard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AddTruckDto } from './dto/addTruckDto';
import { TruckAttachments } from '@/shared/interfaces/interfaces';

@Controller('trucks')
export class TrucksController {
    constructor(private readonly trucksService: TrucksService) { }

    @Get()
    @UseGuards(AuthGuard)
    getTrucks(@Req() req) {
        const { sub, role } = req.user;
        return this.trucksService.getTrucks(sub, role);
    }

    @Get(':truckId')
    @UseGuards(AuthGuard)
    getTruck(@Req() req, @Param('truckId') truckId: string) {
        const { sub } = req.user;
        return this.trucksService.getTrucks(sub, truckId);
    }

    @Post('add')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'truck_license_front', maxCount: 1 },
                { name: 'truck_license_back', maxCount: 1 },
                { name: 'truck_front', maxCount: 1 },
            ],
            {
                limits: {
                    fileSize: 5 * 1024 * 1024,
                },
            }
        ),
    )
    addTruck(
        @Body() data: AddTruckDto,
        @UploadedFiles()
        truckAttachments: TruckAttachments,
        @Req() req,
    ) {
        const user = req.user;
        // console.log("File name : ", truckAttachments.truck_license_front[0].originalname);
        return this.trucksService.addTruck(user, data, truckAttachments);
    }
}
