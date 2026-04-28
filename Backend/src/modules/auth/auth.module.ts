import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@/database/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { WalletService } from '../wallet';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, WalletService],
})
export class AuthModule {}
