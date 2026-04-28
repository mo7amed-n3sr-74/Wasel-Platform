import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  providers: [WalletService, JwtService],
  controllers: [WalletController],
  exports: [WalletService], // Export service for use in other modules
})
export class WalletModule {}
