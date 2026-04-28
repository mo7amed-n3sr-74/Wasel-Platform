import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Invoice, Offer, Profile, Role, Shipment } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(username: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        username,
      },
    });

    if (!profile) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  async getUserShipments(
    userId: string,
    role: Role
  ): Promise<Shipment[] | HttpException> {

    let res = [];
    if (role.includes("MANUFACTURER")) {
      const shipments = await this.prisma.shipment.findMany({
        where: {
          profile: {
            userId
          }
        }
      });

      res = shipments;
    }

    if (["INDEPENDENT_CARRIER", "CARRIER_COMPANY"].includes(role)) {
      const shipments = await this.prisma.shipment.findMany({
        where: {
          acceptedOffer: {
            profile: {
              userId
            }
          }
        },
        include: {
          acceptedOffer: {
            select: {
              id: true,
              price: true,
              proposal: true,
              createdAt: true
            }
          }
        }
      });

      res = shipments;
    }

    if (role.includes("ADMIN")) {
      const shipments = await this.prisma.shipment.findMany({});
      res = shipments;
    }

    if (res.length === 0) {
      throw new HttpException('No shipments found', HttpStatus.NO_CONTENT);
    }

    return res;
  }

  async getUserOffers(userId: string, role: Role): Promise<Offer[] | HttpException> {
    // "ADMIN" | "MANUFACTURER" | "CARRIER_COMPANY" | "INDEPENDENT_CARRIER"
    let res = [];

    if (["CARRIER_COMPANY", "INDEPENDENT_CARRIER"].includes(role)) {
      const offers = await this.prisma.offer.findMany({
        where: {
          profile: {
            userId
          }
        }
      });

      if (offers.length < 1) {
        throw new HttpException('Offers not found', HttpStatus.NO_CONTENT);
      }

      res = offers;
    }

    if(role.includes("MANUFACTURER")) {
      const offers = await this.prisma.offer.findMany({
        where: {
          shipment: {
            profile: {
              userId
            }
          }
        }
      });

      if (offers.length < 1) {
        throw new HttpException('Offers not found', HttpStatus.NO_CONTENT);
      }

      res = offers;
    }

    if (role.includes("ADMIN")) {
      const offers = await this.prisma.offer.findMany({});

      if (offers.length < 1) {
        throw new HttpException('Offers not found', HttpStatus.NO_CONTENT);
      }

      res = offers;
    }

    return res;
  }

  async getUserInvoices(username: string, role: string): Promise<Invoice[]> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...(role.includes('INDEPENDENT_CARRIER')
          ? { carrierId: profile.id }
          : {}),
        ...(role.includes('MANUFACTURER') ? { companyId: profile.id } : {}),
      },
      include: {
        shipment: true,
      },
    });

    if (!invoices.length) {
      throw new HttpException('Invoices not found', HttpStatus.NOT_FOUND);
    }

    return invoices;
  }

  async deleteUser(userId: string): Promise<{
    statusCode: number;
    message: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.delete({
      where: {
        id: userId,
      },
      include: {
        profile: {
          include: {
            offers: true,
            shipments: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: 'account deleted successfully',
    };
  }
}
