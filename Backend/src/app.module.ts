import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './common/guards/jwtAuthGuard';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { OffersModule } from './modules/offers/offers.module';
import { AddressController } from './modules/address/address.controller';
import { AddressService } from './modules/address/address.service';
import { AddressModule } from './modules/address/address.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { R2Controller } from './shared/services/r2/r2.controller';
import { R2Service } from './shared/services/r2/r2.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsService } from './modules/notifications/notifications.service';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WalletModule } from './modules/wallet';
import { TrucksModule } from './modules/trucks/trucks.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
    ShipmentsModule,
    OffersModule,
    AddressModule,
    InvoiceModule,
    PrismaModule,
    DashboardModule,
    NotificationsModule,
    WalletModule,
    TrucksModule
  ],
  controllers: [AppController, AddressController, R2Controller, DashboardController],
  providers: [AppService, AuthGuard, AddressService, R2Service, DashboardService, NotificationsService],
})
export class AppModule {}
