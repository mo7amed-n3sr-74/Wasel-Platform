import { PrismaService } from '@/database/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Truck } from '@prisma/client';
import { AddTruckDto } from './dto/addTruckDto';
import { TruckAttachments } from '@/shared/interfaces/interfaces';
import { R2Service } from '@/shared/services/r2/r2.service';

@Injectable()
export class TrucksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service
    ) {}

    async getTruck(id: string): Promise<Truck> {
        const truck = await this.prisma.truck.findUnique({
            where: {
                id
            }
        });

        if (!truck) 
            throw new HttpException("No truck found", HttpStatus.NO_CONTENT);

        return truck;
    }

    async getTrucks(userId, role): Promise<Truck[]> {
        const trucks = await this.prisma.truck.findMany({
            where: {
                profile: {
                    userId
                }
            }
        })

        if (trucks.length < 1) {
            throw new HttpException("No trucks found", HttpStatus.NO_CONTENT);
        }

        return trucks;
    } 

    async addTruck(user, dto: AddTruckDto, truckAttachments: TruckAttachments): Promise<{
        status: HttpStatus,
        message: string,
        newTruck: Truck
    }> {
        const { sub } = user;

        try {
            const truck_license_front_url = await this.r2.uploadFile(
                truckAttachments.truck_license_front,
                `users/${sub}/trucks/${Date.now()}-${truckAttachments.truck_license_front[0].originalname}`,
            )
            const truck_license_back_url = await this.r2.uploadFile(
                truckAttachments.truck_license_back,
                `users/${sub}/trucks/${Date.now()}-${truckAttachments.truck_license_back[0].originalname}`,
            )
            const truck_front_url = await this.r2.uploadFile(
                truckAttachments.truck_front,
                `users/${sub}/trucks/${Date.now()}-${truckAttachments.truck_front[0].originalname}`,
            )


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
                            userId: sub
                        }
                    }
                }
            })
            
            if (!newTruck) 
                throw new HttpException("Failed to add new truck", HttpStatus.INTERNAL_SERVER_ERROR);

            return {
                status: HttpStatus.OK,
                message: "New truck has been added successfully",
                newTruck
            }

        } catch (err) {
            console.log(err);
            // throw new Error();
        }
    }

}
