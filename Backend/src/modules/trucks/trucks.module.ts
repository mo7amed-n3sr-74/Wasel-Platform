import { Module } from '@nestjs/common';
import { TrucksController } from './trucks.controller';
import { TrucksService } from './trucks.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma/prisma.service';
import { R2Service } from '@/shared/services/r2/r2.service';

@Module({
  exports: [TrucksModule],
  controllers: [TrucksController],
  providers: [TrucksService, JwtService, PrismaService, R2Service]
})
export class TrucksModule {}
