import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SendMail } from '@/shared/services/Nodemailer';
import { OtpGenerator } from '@/shared/services/OtpGenerator';
import { SignupDto } from './dto/signup.dto';
import { usernameVerify } from './dto/username-verify';
import { WalletService } from '../wallet';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly walletService: WalletService,
  ) {}

  async signup({ username, role, email, password }: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }

    if (!existingUser) {
      const userProfile = await this.prisma.profile.findUnique({
        where: {
          username,
        },
      });

      if (userProfile && userProfile.username === username) {
        throw new HttpException(
          'Username already in use',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            username,
            role,
            picture:
              'https://res.cloudinary.com/de5sekaom/image/upload/v1755117756/default-profile-img_f7br6d.jpg',
          },
        },
      },
    });

    const userWallet = await this.walletService.initializeWallet(newUser.id);
    if (!userWallet) throw new HttpException("Failed to create user wallet", HttpStatus.INTERNAL_SERVER_ERROR);

    return {
      statusCode: 201,
      message: 'Account created successfully',
      email: newUser.email,
    };
  }

  async   signin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        profile: {
          select: {
            id: true,
            role: true,
            username: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        username: user.profile.username,
        role: user.profile.role,
      },
      {
        expiresIn: '1h',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refresh: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refresh, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              username: true,
              role: true,
            },
          },
        },
      });

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          username: user.profile.username,
          role: user.profile.role,
        },
        {
          expiresIn: '1h',
        },
      );

      return accessToken;
    } catch {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  async forgetPassword(email: string): Promise<{
    status: HttpStatus;
    message: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }

    const existingOtp = await this.prisma.otp.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });

    if (existingOtp) {
      const canSendOtp =
        Date.now() - new Date(existingOtp.updatedAt).getTime() > 5 * 60 * 1000
          ? true
          : false;
      if (!canSendOtp) {
        throw new HttpException(
          'Please try again later',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const newOtp = OtpGenerator();
    const mailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p style="color: #666; font-size: 16px;">Hello, ${user.profile.first_name?.concat(user.profile.last_name) ? user.profile.first_name + user.profile.last_name : 'There'}</p>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${newOtp}
          </div>
          <p style="color: #666; font-size: 16px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 16px;">If you didn't request this code, please ignore this email.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">This is an automated email, please do not reply.</p>
        </div>
      `;

    try {
      await SendMail(email, 'Your Verification Code', mailHTML);
    } catch {
      throw new HttpException('Failed to send OTP', HttpStatus.NOT_IMPLEMENTED);
    }

    const otpToken: string = await this.jwtService.signAsync(
      { otp: newOtp },
      {
        expiresIn: '10m',
      },
    );

    const storeOtp = await this.prisma.otp.upsert({
      where: {
        profileId: user.profile.id,
      },
      update: {
        otp: otpToken,
      },
      create: {
        otp: otpToken,
        attempts: 0,
        profile: {
          connect: {
            id: user.profile.id,
          },
        },
      },
    });

    if (!storeOtp) {
      throw new HttpException(
        'Failed to store OTP',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    return {
      status: 200,
      message: 'Otp has been sent successfully',
    };
  }

  // Verify Otp
  async otpVerify(
    email: string,
    otp: string,
  ): Promise<{
    status: HttpStatus;
    message: string;
    resetToken: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            id: true,
            otp: {
              select: {
                otp: true,
                attempts: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('Invalid user email', HttpStatus.NOT_ACCEPTABLE);
    }

    try {
      await this.jwtService.verifyAsync(user.profile.otp.otp);
    } catch (err) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    const storedOtp: {
      otp: string;
      iat: number;
      exp: string;
    } | null = await this.jwtService.verifyAsync(user.profile.otp.otp);

    if (storedOtp.otp !== otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    const updateOtp = await this.prisma.otp.update({
      where: {
        profileId: user.profile.id,
      },
      data: {
        otp: '',
      },
    });

    if (!updateOtp) {
      throw new HttpException(
        'OTP verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resetToken = await this.jwtService.signAsync(
      {
        userId: user.id,
        email: user.email,
        profileId: user.profile.id,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      status: HttpStatus.OK,
      message: 'Otp verified successfully',
      resetToken,
    };
  }

  // Resend OTP
  async otpResend(email: string, profileId: string) {
    const oldOtp = await this.prisma.otp.findUnique({
      where: {
        profileId,
      },
    });

    const otpTime = new Date(oldOtp.updatedAt).getTime();
    const canResend = Date.now() - otpTime > 5 * 60 * 1000 ? true : false;

    if (!canResend || !oldOtp) {
      throw new HttpException("Can't resend OTP", HttpStatus.BAD_REQUEST);
    }

    const newOtp = OtpGenerator();
    const mailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${newOtp}
          </div>
          <p style="color: #666; font-size: 16px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 16px;">If you didn't request this code, please ignore this email.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">This is an automated email, please do not reply.</p>
        </div>
      `;

    try {
      await SendMail(email, 'Your Verification Code', mailHTML);
    } catch {
      throw new HttpException('Failed to send OTP', HttpStatus.NOT_IMPLEMENTED);
    }

    const newOtpToken = await this.jwtService.signAsync(
      { otp: newOtp },
      { expiresIn: '5m' },
    );

    const updateOtp = await this.prisma.otp.upsert({
      where: {
        profileId,
      },
      update: {
        otp: newOtpToken,
      },
      create: {
        otp: newOtpToken,
        attempts: 0,
        profile: {
          connect: {
            id: profileId,
          },
        },
      },
    });

    if (!updateOtp) {
      throw new HttpException(
        'Failed to update & store OTP',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: `OTP has been resend successfully on ${email}`,
    };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{
    status: HttpStatus;
    message: string;
  }> {
    const token: {
      email: string;
      iat: number;
      exp: number;
    } = await this.jwtService.verifyAsync(resetToken);

    const { email } = token;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePassword = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatePassword) {
      throw new HttpException(
        'Failed to update password',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: HttpStatus.OK,
      message: 'Password reseted successfully',
    };
  }

  async usernameVerify(username) {
    const usernameExsiting = await this.prisma.profile.findUnique({
      where: {
        username,
      },
    });

    if (usernameExsiting) {
      throw new HttpException(
        'Username is already in use',
        HttpStatus.CONFLICT,
      );
    }

    return {
      status: HttpStatus.OK,
      message: 'Username is available',
    };
  }
}
