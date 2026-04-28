import { Controller, Param, Delete, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@/common/guards/jwtAuthGuard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/shipments')
  @UseGuards(AuthGuard)
  getUserShipments(@Req() req) {
    const { sub, role } = req.user;
    return this.userService.getUserShipments(sub, role);
  }

  @Get('/offers')
  @UseGuards(AuthGuard)
  getUserOffers(@Req() req) {
    const { sub, role } = req.user;
    return this.userService.getUserOffers(sub, role);
  }

  @Get('/invoices')
  @UseGuards(AuthGuard)
  getUserInvoices(@Req() req) {
    const { username, role } = req.user;
    return this.userService.getUserInvoices(username, role);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getCurrentUser(@Req() req) {
    const username = req.user.username;
    return this.userService.getUser(username);
  }

  // @UseGuards(AuthGuard)
  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.getUser(username);
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  deleteUser(@Req() req) {
    const userId = req.user.sub as string;
    return this.userService.deleteUser(userId);
  }
}
