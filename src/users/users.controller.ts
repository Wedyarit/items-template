import { Body, Controller, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  async changePassword(
    @Body() body: UpdateUserDto,
    @Request() req: { user: AuthUser },
  ) {
    await this.usersService.updatePassword(req.user.userId, body.password);
    return { message: 'Password updated successfully' };
  }
}
