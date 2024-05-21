import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Module,
} from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('api/user')
@Module({
  imports: [UserService],
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  async show(@Param('userId') userId: string) {
    const user = await this.userService.user({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
    };
  }
}
