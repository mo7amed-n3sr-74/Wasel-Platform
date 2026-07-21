import { PrismaService } from '@/database/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role, Truck, VerificationStatus } from '@prisma/client';
import { AddTruckDto } from './dto/addTruckDto';
import { UpdateTruckDto } from './dto/updateTruckDto';
import { TruckAttachments } from '@/shared/interfaces/interfaces';
import { R2Service } from '@/shared/services/r2/r2.service';
import * as path from 'path';

@Injectable()
export class TrucksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  // Helper method
  private getR2KeyFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      // console.log(pathname.replace(/^\/+/, ''));
      return pathname.replace(/^\/+/, '');
    } catch (err) {
      throw new HttpException(
        'Invalid R2 file URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Service methods
  async getTruck(id: string): Promise<Truck> {
    const truck = await this.prisma.truck.findUnique({
      where: {
        id,
      },
    });

    if (!truck)
      throw new HttpException('No truck found', HttpStatus.NO_CONTENT);

    return truck;
  }

  async getTrucks(userId, role): Promise<Truck[]> {

    let trucks = [];

    if (Role.ADMIN.includes(role)) {
      trucks = await this.prisma.truck.findMany();
    } else {
      trucks = await this.prisma.truck.findMany({
        where: {
          profile: {
            userId,
          },
        },
      });
    }

    if (trucks.length < 1) {
      throw new HttpException('No trucks found', HttpStatus.NO_CONTENT);
    }

    return trucks;
  }

  async addTruck(
    user,
    dto: AddTruckDto,
    truckAttachments: TruckAttachments,
  ): Promise<{
    status: HttpStatus;
    message: string;
    newTruck: Truck;
  }> {
    const { sub } = user;

    const { truck_license_front, truck_license_back, truck_front } =
      truckAttachments;
    if (!truck_license_front || !truck_license_back || !truck_front)
      throw new HttpException(
        'Please upload all required documents',
        HttpStatus.BAD_REQUEST,
      );

    const ext_front = path.extname(truck_license_front[0].originalname);
    const ext_back = path.extname(truck_license_back[0].originalname);
    const ext_truck = path.extname(truck_front[0].originalname);

    const truck_license_front_url = await this.r2.uploadFile(
      truck_license_front[0],
      `users/${sub}/trucks/${Date.now()}-${truck_license_front[0].fieldname}${ext_front}`,
    );
    const truck_license_back_url = await this.r2.uploadFile(
      truck_license_back[0],
      `users/${sub}/trucks/${Date.now()}-${truck_license_back[0].fieldname}${ext_back}`,
    );
    const truck_front_url = await this.r2.uploadFile(
      truck_front[0],
      `users/${sub}/trucks/${Date.now()}-${truck_front[0].fieldname}${ext_truck}`,
    );

    const newTruck = await this.prisma.truck.create({
      data: {
        truck_license_front: truck_license_front_url,
        truck_license_back: truck_license_back_url,
        truck_front: truck_front_url,
        truck_num: dto.truck_num,
        truck_model: dto.truck_model,
        truck_type: dto.truck_type,
        profile: {
          connect: {
            userId: sub,
          },
        },
      },
    });

    if (!newTruck)
      throw new HttpException(
        'Failed to add new truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return {
      status: HttpStatus.OK,
      message: 'New truck has been added successfully',
      newTruck,
    };
  }

  async deleteTruck(user, truckId): Promise<Truck> {
    const { sub } = user;

    const truck = await this.prisma.truck.findUnique({
      where: {
        id: truckId,
      },
    });

    if (!truck)
      throw new HttpException('No truck found', HttpStatus.NO_CONTENT);

    const keys = [
      truck.truck_license_front,
      truck.truck_license_back,
      truck.truck_front,
    ].map((url) => this.getR2KeyFromUrl(url));

    await Promise.all(keys.map((key) => this.r2.deleteFile(key)));

    const deletedTruck = await this.prisma.truck.delete({
      where: {
        id: truckId,
      },
    });

    if (!deletedTruck)
      throw new HttpException(
        'Failed to delete your truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return deletedTruck;
  }

  async updateTruck(
    user,
    truckId: string,
    dto: UpdateTruckDto,
    truckAttachments: TruckAttachments,
  ): Promise<{
    status: HttpStatus;
    message: string;
    updatedTruck: Truck;
  }> {
    const { sub } = user;

    const truck = await this.prisma.truck.findUnique({
      where: {
        id: truckId,
        profile: {
          userId: sub,
        },
      },
    });

    if (!truck)
      throw new HttpException('No truck found', HttpStatus.NO_CONTENT);

    const updateData: any = {};

    if (dto.truck_num) updateData.truck_num = dto.truck_num;
    if (dto.truck_type) updateData.truck_type = dto.truck_type;
    if (dto.truck_model) updateData.truck_model = dto.truck_model;

    const { truck_license_front, truck_license_back, truck_front } =
      truckAttachments || {};

    const oldKeys: string[] = [];

    if (truck_license_front && truck_license_front.length > 0) {
      const ext = path.extname(truck_license_front[0].originalname);
      const url = await this.r2.uploadFile(
        truck_license_front[0],
        `users/${sub}/trucks/${Date.now()}-${truck_license_front[0].fieldname}${ext}`,
      );
      updateData.truck_license_front = url;
      oldKeys.push(this.getR2KeyFromUrl(truck.truck_license_front));
    }

    if (truck_license_back && truck_license_back.length > 0) {
      const ext = path.extname(truck_license_back[0].originalname);
      const url = await this.r2.uploadFile(
        truck_license_back[0],
        `users/${sub}/trucks/${Date.now()}-${truck_license_back[0].fieldname}${ext}`,
      );
      updateData.truck_license_back = url;
      oldKeys.push(this.getR2KeyFromUrl(truck.truck_license_back));
    }

    if (truck_front && truck_front.length > 0) {
      const ext = path.extname(truck_front[0].originalname);
      const url = await this.r2.uploadFile(
        truck_front[0],
        `users/${sub}/trucks/${Date.now()}-${truck_front[0].fieldname}${ext}`,
      );
      updateData.truck_front = url;
      oldKeys.push(this.getR2KeyFromUrl(truck.truck_front));
    }

    const updatedTruck = await this.prisma.truck.update({
      where: {
        id: truckId,
      },
      data: updateData,
    });

    if (!updatedTruck)
      throw new HttpException(
        'Failed to update truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    await Promise.all(oldKeys.map((key) => this.r2.deleteFile(key)));

    return {
      status: HttpStatus.OK,
      message: 'Truck has been updated successfully',
      updatedTruck,
    };
  }

  async verifyTruck(truckId: string): Promise<{
    status: HttpStatus,
    message: string,
    truck: Truck
  }> {

    const truck = await this.prisma.truck.findUnique({
      where: {
        id: truckId,
        verificationStatus: VerificationStatus.PENDING
      }
    });

    if (!truck)
      throw new HttpException("No trucks found", HttpStatus.NO_CONTENT);

    const verifiedTruck = await this.prisma.truck.update({
      where: {
        id: truckId,
      },
      data: {
        verificationStatus: VerificationStatus.VERIFIED
      }
    });


    return {
      status: HttpStatus.OK,
      message: "Truck verified successfully",
      truck: verifiedTruck
    }
  }
}
