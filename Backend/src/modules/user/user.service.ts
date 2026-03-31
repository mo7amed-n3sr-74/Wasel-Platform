import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Invoice, Offer, Profile, Shipment } from '@prisma/client';

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
    username: string,
  ): Promise<Shipment[] | HttpException> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        shipments: {
          include: {
            acceptedOffer: {
              include: {
                profile: {
                  select: {
                    username: true,
                    first_name: true,
                    last_name: true,
                    role: true
                  }
                }
              }
            }
          }
        },
      },
    });

    const { shipments } = profile;
    if (shipments.length === 0) {
      throw new HttpException('No shipments found', HttpStatus.NO_CONTENT);
    }

    return shipments;
  }

  async getUserOffers(username: string): Promise<Offer[] | HttpException> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        offers: true,
      },
    });

    const { offers } = profile;
    if (offers.length < 1) {
      throw new HttpException('Offers not found', HttpStatus.NOT_FOUND);
    }

    return offers;
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
