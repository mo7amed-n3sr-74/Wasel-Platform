import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Offer, Role, Shipment, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { R2Service } from '@/shared/services/r2/r2.service';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly R2Service: R2Service,
  ) {}

  async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findUnique({
      where: {
        id: shipmentId,
      },
      include: {
        profile: true,
        attachments: true,
        acceptedOffer: {
          include: {
            profile: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    if (!shipment) {
      throw new HttpException('Shipment not found', HttpStatus.NO_CONTENT);
    }

    return shipment;
  }

  async getShipments(query): Promise<{
    total: number;
    shipments: Shipment[];
  }> {

    const { type, minWeight, maxWeight, urgent, search } = query;

    const shipments = await this.prisma.shipment.findMany({
      where: {
        ...(type? { shipmentType: type } : {}),
        ...(urgent? { urgent: true } : {}),
        ...(!isNaN(Number(minWeight)) && !isNaN(Number(maxWeight))? {
          AND: [
            { weight: { gt: Number(minWeight) } },
            { weight: { lte: Number(maxWeight) } },
          ]
        } : {}),
        ...(search? {
          OR: [
            {
              origin: {
                contains: search
              }, 
            }, {
              destination: {
                contains: search
              }
            }
          ]
        }: {}),
      },
      include: {
        attachments: {
          select: {
            attachmentType: true,
            url: true,
          },
        },
        profile: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (shipments.length < 1) {
      throw new HttpException('Shipments not found', HttpStatus.NO_CONTENT);
    }

    return {
      total: shipments.length,
      shipments,
    };
  }

  async getShipmentOffers(profileId, shipmentId): Promise<Offer[]> {
    const offers = await this.prisma.offer.findMany({
      where: {
        profileId,
        shipmentId,
      },
      include: {
        profile: {
          select: {
            username: true,
            first_name: true,
            last_name: true,
            picture: true
          }
        },
        shipment: true,
      }
    });

    if (offers.length < 1) {
      throw new HttpException(
        'Shipment has no offers yet',
        HttpStatus.NO_CONTENT,
      );
    }

    return offers;
  }

  async createShipment(
    userId,
    data: CreateShipmentDto,
    shipmentAssets: {
      shipmentImgs: Express.Multer.File[];
      shipmentDocs: Express.Multer.File[];
    },
  ) {
    const userProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (userProfile.role !== Role.MANUFACTURER) {
      throw new HttpException(
        'Failed to post the shipment',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const { shipmentImgs, shipmentDocs } = shipmentAssets;
    if (shipmentImgs.length < 1 || shipmentDocs.length < 1) {
      throw new HttpException(
        "Shipment's docs or imgs are not found",
        HttpStatus.BAD_REQUEST,
      );
    }

    const shipmentId =
      'load#' + (Math.floor(Math.random() * 1000000000) + 1000000000);

    const {
      origin,
      origin_lat,
      origin_lng,
      destination,
      destination_lat,
      destination_lng,
      goodsType,
      shipmentType,
      description,
      packaging,
      width,
      length,
      height,
      weight,
      pickupAt,
      deliveryAt,
      stacking,
      urgent,
      twoDrivers,
      additionalInsurance,
      noFriday,
      budgetType,
      paymentType,
      suggestedBudget,
      ETA,
      distance
    } = data;

    const newShipment = await this.prisma.shipment.create({
      data: {
        shipmentId,
        origin,
        origin_lat: origin_lat ? origin_lat : 0,
        origin_lng: origin_lng ? origin_lng : 0,
        destination,
        destination_lat: destination_lat ? destination_lat : 0,
        destination_lng: destination_lng ? destination_lng : 0,
        goodsType,
        shipmentType,
        description,
        packaging,
        width,
        length,
        height,
        weight,
        pickupAt,
        deliveryAt,
        stacking,
        urgent,
        twoDrivers,
        additionalInsurance,
        noFriday,
        budgetType,
        paymentType,
        suggestedBudget,
        offerCount: 0,
        ETA,
        distance,
        profile: {
          connect: {
            id: userProfile.id,
          },
        },
      },
    });

    for (const file of shipmentAssets.shipmentImgs) {
      const type = file.mimetype.split('/')[0];
      const name = file.originalname.split(".").slice(0, file.originalname.split(".").length - 1).join(".");
      const extension = file.originalname.split(".").splice(file.originalname.split(".").length - 1, 1)[0];
      const size = (file.size / 1024 / 1024).toFixed(2); // MB
      const imageUrl = await this.R2Service.uploadFile(
        file,
        `users/${userId}/shipments/images/${Date.now()}-${file.originalname}`,
      );
      await this.prisma.shipmentAttachment.create({
        data: {
          attachmentType: type === 'image' ? 'Image' : 'File',
          url: imageUrl,
          name,
          extension,
          size: `${size} MB`,
          shipment: {
            connect: {
              id: newShipment.id,
            },
          },
        },
      });
    }

    for (const file of shipmentAssets.shipmentDocs) {
      const type = file.mimetype.split('/')[0];
      const name = file.originalname.split(".").slice(0, file.originalname.split(".").length - 1).join(".");
      const extension = file.originalname.split(".").splice(file.originalname.split(".").length - 1, 1)[0];
      const size = (file.size / 1024 / 1024).toFixed(2); // MB
      const docUrl = await this.R2Service.uploadFile(
        file,
        `users/${userId}/shipments/docs/${Date.now()}-${file.originalname}`,
      );
      await this.prisma.shipmentAttachment.create({
        data: {
          attachmentType: type === 'image' ? 'Image' : 'File',
          url: docUrl,
          name,
          extension,
          size: `${size} MB`,
          shipment: {
            connect: {
              id: newShipment.id,
            },
          },
        },
      });
    }

    return {
      status: 201,
      message: 'Shipment posted successfully',
    };
  }

  async deleteShipment(
    shipmentId: string,
    userId: string,
  ): Promise<{
    status: HttpStatus;
    message: string;
    deletedShipment: Shipment;
  }> {
    const userProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        shipments: {
          where: {
            id: shipmentId,
          },
        },
      },
    });

    if (userProfile.shipments.length < 1) {
      throw new HttpException('Shipment not found', HttpStatus.BAD_REQUEST);
    }

    const deleteShipment = await this.prisma.shipment.delete({
      where: {
        id: shipmentId,
      },
    });

    if (!deleteShipment) {
      throw new HttpException(
        'Failed to delete the shipment',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 200,
      message: 'Shipment deleted successfully',
      deletedShipment: deleteShipment,
    };
  }

  async updateShipment(
    shipmentId: string,
    body: UpdateShipmentDto,
  ): Promise<{
    status: HttpStatus;
    message: string;
    updatedShipment: Shipment;
  }> {
    const updateObject = {};
    for (const [key, value] of Object.entries(body)) {
      if (!value) continue;
      updateObject[key] = value;
    }

    if (body.status && !ShipmentStatus[body.status]) {
      throw new HttpException(
        'Invalid shipment status',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateShipment = await this.prisma.shipment.update({
      where: {
        id: shipmentId,
      },
      data: updateObject,
    });

    if (!updateShipment) {
      throw new HttpException('Shipment not found', HttpStatus.BAD_REQUEST);
    }

    return {
      status: 200,
      message: 'Shipment updated successfully',
      updatedShipment: updateShipment,
    };
  }
}
