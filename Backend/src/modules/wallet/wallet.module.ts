import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { StripeModule } from '@/modules/stripe';

@Module({
  imports: [PrismaModule, StripeModule],
  providers: [WalletService, JwtService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
