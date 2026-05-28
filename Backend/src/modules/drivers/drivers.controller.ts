import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { AuthGuard } from '@/common/guards/jwtAuthGuard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateDriverDto } from './dto/createDriverDto';
import { UpdateDriverDto } from './dto/updateDriverDto';
import { DriverAttachments } from '@/shared/interfaces/interfaces';
import { Roles } from '@/common/decorators/roles.decorator';

@Roles(['CARRIER_COMPANY'])
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @UseGuards(AuthGuard)
  getDrivers(@Req() req) {
    const { sub } = req.user;
    return this.driversService.getDrivers(sub);
  }

  @Get(':driverId')
  @UseGuards(AuthGuard)
  getDriver(@Param('driverId') driverId: string) {

    return this.driversService.getDriver(driverId);
  }

  @Post('add')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'picture', maxCount: 1 },
        { name: 'license_front', maxCount: 1 },
        { name: 'license_back', maxCount: 1 },
        { name: 'national_id_card_front', maxCount: 1 },
        { name: 'national_id_card_back', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
  createDriver(
    @Body() data: CreateDriverDto,
    @UploadedFiles() attachments: DriverAttachments,
    @Req() req,
  ) {
    const user = req.user;
    return this.driversService.createDriver(user, data, attachments);
  }

  @Delete(':driverId')
  @UseGuards(AuthGuard)
  deleteDriver(@Param('driverId') driverId: string, @Req() req) {
    const user = req.user;
    return this.driversService.deleteDriver(user, driverId);
  }

  @Put(':driverId')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'picture', maxCount: 1 },
        { name: 'license_front', maxCount: 1 },
        { name: 'license_back', maxCount: 1 },
        { name: 'national_id_card_front', maxCount: 1 },
        { name: 'national_id_card_back', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
  updateDriver(
    @Param('driverId') driverId: string,
    @Body() data: UpdateDriverDto,
    @UploadedFiles() attachments: DriverAttachments,
    @Req() req,
  ) {
    const user = req.user;
    return this.driversService.updateDriver(user, driverId, data, attachments);
  }
}
