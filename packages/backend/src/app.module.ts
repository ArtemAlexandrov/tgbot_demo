import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TelegramBotService } from './services/telegram-bot.service';
import { UserController } from './controllers/user.controller';
import { PrismaService } from './services/prisma.service';
import { UserService } from './services/user.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [TelegramBotService, PrismaService, UserService],
  controllers: [UserController],
})
export class AppModule {}
