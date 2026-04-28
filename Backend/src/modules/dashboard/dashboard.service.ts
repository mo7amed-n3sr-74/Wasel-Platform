import { PrismaService } from '@/database/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WalletService } from '../wallet';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {

    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async getStats (req) {
        const userId = req.user.sub as string;
        const role: Role = req.user.role;

        let res = {};

        // const profile = await this.prismaService.profile.findUnique({
        //     where: {
        //         userId
        //     }
        // })

        const shipments  = await this.prismaService.shipment.count({
            where: {
                profile: {
                    userId
                }
            }
        });

        if (Role.CARRIER_COMPANY.includes(role) || Role.MANUFACTURER.includes(role)) {
            const activeShipments = await this.prismaService.shipment.count({
                where: {
                    status: "PENDING",
                    profile: {
                        userId
                    }
                }
            });
    
            const compoletedShipments = await this.prismaService.shipment.count({
                where: {
                    status: "DELIVERED"
                }
            });

            const wallet = await this.prismaService.wallet.findUnique({
                where: {
                    userId,
                },
                select: {
                    balance: true
                }
            })

            if (!wallet) throw new HttpException("Failed to retrieve wallet balance", HttpStatus.INTERNAL_SERVER_ERROR);

            res["shipments"] = shipments;
            res["activeShipments"] = activeShipments;
            res["completedShipments"] = compoletedShipments;
            res["balance"] = wallet.balance || 0;
            res["totalSpent"] = 0;

        }

        return res;
    }
}
