import { PrismaService } from '@/database/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Driver } from '@prisma/client';
import { CreateDriverDto } from './dto/createDriverDto';
import { UpdateDriverDto } from './dto/updateDriverDto';
import { DriverAttachments } from '@/shared/interfaces/interfaces';
import { R2Service } from '@/shared/services/r2/r2.service';
import * as path from 'path';
import { OtpGenerator } from '@/shared/services/OtpGenerator';

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  private getR2KeyFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      return pathname.replace(/^\/+/, '');
    } catch (err) {
      throw new HttpException(
        'Invalid R2 file URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDriver(id: string): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!driver)
      throw new HttpException('No driver found', HttpStatus.NO_CONTENT);

    return driver;
  }

  async getDrivers(userId: string): Promise<Driver[]> {
    const drivers = await this.prisma.driver.findMany({
      where: {
        profile: {
          userId,
        },
      },
    });

    if (drivers.length < 1) {
      throw new HttpException('No drivers found', HttpStatus.NO_CONTENT);
    }

    return drivers;
  }

  async createDriver(
    user,
    dto: CreateDriverDto,
    attachments: DriverAttachments,
  ): Promise<{
    status: HttpStatus;
    message: string;
    driver: Driver;
  }> {
    const { sub } = user;

    const {
      picture,
      license_front,
      license_back,
      national_id_card_front,
      national_id_card_back,
    } = attachments || {};

    if (
      !picture ||
      !license_front ||
      !license_back ||
      !national_id_card_front ||
      !national_id_card_back
    ) {
      throw new HttpException(
        'Please upload all required documents',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ext_picture = path.extname(picture[0].originalname);
    const ext_license_front = path.extname(license_front[0].originalname);
    const ext_license_back = path.extname(license_back[0].originalname);
    const ext_national_front = path.extname(
      national_id_card_front[0].originalname,
    );
    const ext_national_back = path.extname(
      national_id_card_back[0].originalname,
    );

    const picture_url = await this.r2.uploadFile(
      picture[0],
      `users/${sub}/drivers/${Date.now()}-${picture[0].fieldname}${ext_picture}`,
    );

    const license_front_url = await this.r2.uploadFile(
      license_front[0],
      `users/${sub}/drivers/${Date.now()}-${license_front[0].fieldname}${ext_license_front}`,
    );

    const license_back_url = await this.r2.uploadFile(
      license_back[0],
      `users/${sub}/drivers/${Date.now()}-${license_back[0].fieldname}${ext_license_back}`,
    );

    const national_id_card_front_url = await this.r2.uploadFile(
      national_id_card_front[0],
      `users/${sub}/drivers/${Date.now()}-${national_id_card_front[0].fieldname}${ext_national_front}`,
    );

    const national_id_card_back_url = await this.r2.uploadFile(
      national_id_card_back[0],
      `users/${sub}/drivers/${Date.now()}-${national_id_card_back[0].fieldname}${ext_national_back}`,
    );

    const newDriver = await this.prisma.driver.create({
      data: {
        driverId: `dev-${OtpGenerator()}`,
        first_name: dto.first_name,
        last_name: dto.last_name,
        age: dto.age,
        national_id: dto.national_id,
        phone: dto.phone,
        picture: picture_url,
        license_front: license_front_url,
        license_back: license_back_url,
        national_id_card_front: national_id_card_front_url,
        national_id_card_back: national_id_card_back_url,
        profile: {
          connect: {
            userId: sub,
          },
        },
      },
    });

    if (!newDriver)
      throw new HttpException(
        'Failed to add new driver',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return {
      status: HttpStatus.OK,
      message: 'New driver has been added successfully',
      driver: newDriver,
    };
  }

  async deleteDriver(user, driverId: string): Promise<Driver> {
    const { sub } = user;

    const driver = await this.prisma.driver.findUnique({
      where: {
        id: driverId,
        profile: {
          userId: sub,
        },
      },
    });

    if (!driver)
      throw new HttpException('No driver found', HttpStatus.NO_CONTENT);

    const keys = [
      driver.picture,
      driver.license_front,
      driver.license_back,
      driver.national_id_card_front,
      driver.national_id_card_back,
    ].map((url) => this.getR2KeyFromUrl(url));

    await Promise.all(keys.map((key) => this.r2.deleteFile(key)));

    const deletedDriver = await this.prisma.driver.delete({
      where: {
        id: driverId,
      },
    });

    if (!deletedDriver)
      throw new HttpException(
        'Failed to delete driver',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return deletedDriver;
  }

  async updateDriver(
    user,
    driverId: string,
    dto: UpdateDriverDto,
    attachments: DriverAttachments,
  ): Promise<{
    status: HttpStatus;
    message: string;
    updatedDriver: Driver;
  }> {
    const { sub } = user;

    const driver = await this.prisma.driver.findUnique({
      where: {
        id: driverId,
        profile: {
          userId: sub,
        },
      },
    });

    if (!driver)
      throw new HttpException('No driver found', HttpStatus.NO_CONTENT);

    const updateData: any = {};

    if (dto.first_name) updateData.first_name = dto.first_name;
    if (dto.last_name) updateData.last_name = dto.last_name;
    if (dto.age) updateData.age = dto.age;
    if (dto.national_id) updateData.national_id = dto.national_id;

    const {
      picture,
      license_front,
      license_back,
      national_id_card_front,
      national_id_card_back,
    } = attachments || {};

    if (picture && picture.length > 0) {
      await this.r2.uploadFile(
        picture[0],
        this.getR2KeyFromUrl(driver.picture),
      );
    }

    if (license_front && license_front.length > 0) {
      await this.r2.uploadFile(
        license_front[0],
        this.getR2KeyFromUrl(driver.license_front),
      );
    }

    if (license_back && license_back.length > 0) {
      await this.r2.uploadFile(
        license_back[0],
        this.getR2KeyFromUrl(driver.license_back),
      );
    }

    if (national_id_card_front && national_id_card_front.length > 0) {
      await this.r2.uploadFile(
        national_id_card_front[0],
        this.getR2KeyFromUrl(driver.national_id_card_front),
      );
    }

    if (national_id_card_back && national_id_card_back.length > 0) {
      await this.r2.uploadFile(
        national_id_card_back[0],
        this.getR2KeyFromUrl(driver.national_id_card_back),
      );
    }

    const updatedDriver = await this.prisma.driver.update({
      where: {
        id: driverId,
      },
      data: updateData,
    });

    if (!updatedDriver)
      throw new HttpException(
        'Failed to update driver',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return {
      status: HttpStatus.OK,
      message: 'Driver has been updated successfully',
      updatedDriver,
    };
  }
}
