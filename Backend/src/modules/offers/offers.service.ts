import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Offer, OfferStatus } from '@prisma/client';
import { CreateOfferDTO } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOffer(profileId: string, offerId: string): Promise<Offer> {
    const offer = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        profileId,
      },
    });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.BAD_REQUEST);
    }

    return offer;
  }

  async getRecentOffers(req) {
    const userId = req.user.sub as string;
    const role = req.user.role as string;

    if (role == "ADMIN") {
      const recentTenOffers = await this.prisma.offer.findMany({
        where: {
          status: "PENDING"
        },    
        orderBy: {
          createdAt:  "desc"
        },
        take: 10
      });

      return recentTenOffers;
    }

    if (role === "MANUFACTURER") {
      const recentTenOffers = await this.prisma.offer.findMany({
        where: { 
          status: {
            in: ["PENDING"]
          },
          shipment: {
            profile: {
              userId
            }
          }
        },
        select: {
          id: true,
          price: true,
          proposal: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              picture: true,
              username: true,
              company_name: true,
            }
          },
          shipment: {
            select: {
              origin: true,
              destination: true,
              distance: true,
              ETA: true,
              id: true,
              shipmentId: true,
              profile: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  picture: true,
                  username: true,
                  // company_name: true,
                }
              },
            }
          }
        },
        orderBy: {
          createdAt:  "desc"
        },
        take: 10,
      });

      return recentTenOffers;
    }

    throw new HttpException("No offers found", HttpStatus.NO_CONTENT);
  }

  async getOffers(): Promise<Offer[]> {
    const offers = await this.prisma.offer.findMany({
      include: {
        profile: {
          select: {
            username: true,
            first_name: true,
            last_name: true,
            picture: true,
            verify: true
          }
        },
        shipment: true
      }
    });

    if (offers.length < 1) {
      throw new HttpException('Offers not found', HttpStatus.NOT_FOUND);
    }

    return offers;
  }

  async createOffer(
    userId: string,
    shipmentId: string,
    { price, proposal }: CreateOfferDTO,
  ): Promise<{
    status: HttpStatus;
    message: string;
    newOffer: Offer;
  }> {

    const shipment = await this.prisma.shipment.findUnique({
      where: {
        id: shipmentId,
        status: "PENDING"
      }
    });

    if (!shipment)
      throw new HttpException("Invalid shipment id", HttpStatus.BAD_REQUEST);

    const userProfile = await this.prisma.profile.findUnique({
      where: {
        userId
      },
    })

    const existingOffer = await this.prisma.offer.findFirst({
      where: {
        shipmentId,
        status: "PENDING",
        profile: {
          userId
        }
      }
    });

    if (existingOffer)
      throw new HttpException(`You've already sent your offer and ${existingOffer.status}`, HttpStatus.BAD_REQUEST);

    const newOffer = await this.prisma.offer.create({
      data: {
        price,
        proposal,
        shipmentId,
        profileId: userProfile.id,
      }
    });

    if (!newOffer)
      throw new HttpException('Failed to send your offer', HttpStatus.INTERNAL_SERVER_ERROR);

    const shipmentOffers = await this.prisma.offer.count({
      where: {
        shipmentId 
      }
    })

    const updateShipment = await this.prisma.shipment.update({
      where: {
        id: shipmentId
      },
      data: {
        offerCount: shipmentOffers
      }
    })

    if (!updateShipment)
      throw new HttpException("Failed tp update shipment", HttpStatus.INTERNAL_SERVER_ERROR);

    return {
      status: HttpStatus.CREATED,
      message: 'Your offer sent successfully',
      newOffer,
    };
  }

  async acceptOffer(offerId: string): Promise<Offer> | null {

    const acceptedOffer = await this.prisma.offer.update({
      where: {
        id: offerId,
        status: "PENDING"
      },
      data: {
        status: "ACCEPTED"
      }
    });

    if (!acceptedOffer)
      throw new HttpException("Failed to accept offer", HttpStatus.INTERNAL_SERVER_ERROR);
    
    const rejectedOffers = await this.prisma.offer.updateMany({
      where: {
        shipmentId: acceptedOffer.shipmentId,
        status: "PENDING"
      }, 
      data: {
        status: "REJECTED"
      }
    })

    if (!rejectedOffers)
      throw new HttpException("Failed to reject offers", HttpStatus.INTERNAL_SERVER_ERROR);
    
    const updateShipment = await this.prisma.shipment.update({
      where: {
        id: acceptedOffer.shipmentId
      },
      data: {
        status: "IN_PROGRESS",
        acceptedOfferId: offerId
      }
    })
    
    if (!updateShipment)
      throw new HttpException("Failed to update shipment", HttpStatus.INTERNAL_SERVER_ERROR);

    return acceptedOffer;
  }

  async rejectOffer(offerId: string): Promise<Offer> {

    // Check if offer is rejected
    const offerRejected = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        status: "REJECTED"
      }
    })

    if (offerRejected) {
      throw new HttpException('Offer has been rejected', HttpStatus.BAD_REQUEST);
    }

    const updatedOffer = await this.prisma.offer.update({
      where: {
        id: offerId,
        status: "PENDING"
      }, 
      data: {
        status: "REJECTED"
      }
    });
    
    if (!updatedOffer)
      throw new HttpException("Failed to update shipment offer", HttpStatus.INTERNAL_SERVER_ERROR );

    return updatedOffer;
  }

  async updateOffer(offerId: string, status: string): Promise<Offer> {
    if (!OfferStatus[status]) {
      throw new HttpException('Invalid offer status', HttpStatus.BAD_REQUEST);
    }

    const offer = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        status: OfferStatus.PENDING,
      },
    });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.BAD_REQUEST);
    }

    const updateOffer = await this.prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status: OfferStatus[status],
      },
    });

    return updateOffer;
  }

  async deleteOffer(
    userId: string,
    offerId: string,
  ): Promise<{
    message: string;
    deletedOffer: Offer;
  }> {
    const offer = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        OR: [
          { status: "PENDING" },
          { status: "REJECTED" }
        ],
        profile: {
          userId
        }
      },
    });

    if (!offer) {
      throw new HttpException('No offer found', HttpStatus.NO_CONTENT);
    }

    const deletedOffer = await this.prisma.offer.delete({
      where: {
        id: offerId,
        OR: [
          { status: "PENDING" },
          { status: "REJECTED" }
        ],
        profile: {
          userId
        }
      },
    });

    return {
      message: 'Offer deleted successfully',
      deletedOffer: deletedOffer,
    };
  }
}
