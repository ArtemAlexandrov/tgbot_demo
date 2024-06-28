import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { UserService } from './user.service';
import * as process from 'node:process';
import { Role } from '@prisma/client';
import { UnauthenticatedError } from '../errors/unauthenticated.error';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private bot: TelegramBot;

  constructor(private userService: UserService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
  }

  private initializeCommands() {
    this.initStartHandler();
    this.initAdminHelloHandler();

    this.initDebugHandler();
  }

  public onModuleInit() {
    this.initializeCommands();
  }

  public async onModuleDestroy() {
    try {
      await this.bot.stopPolling();
    } catch (error) {
      console.error('Error stopping bot polling', error);
    }
  }

  private initAdminHelloHandler() {
    this.bot.onText(/\/adminhello (\d+) (.+)/, async (msg, match) => {
      const [, targetId, message] = match;
      try {
        await this.ensureUserIsAdmin(msg);
        const user = await this.userService.user({
          telegramId: parseInt(targetId),
        });
        if (!user) {
          await this.sendMessage(msg.chat.id, 'User not found');
          return;
        }
        await this.sendMessage(user.telegramId, `Hello from admin: ${message}`);
        await this.sendMessage(msg.chat.id, 'Message sent');
      } catch (error) {
        if (error instanceof UnauthenticatedError) {
          return;
        } else {
          throw error;
        }
      }
    });
  }

  private initStartHandler() {
    this.bot.onText(/\/start/, async (msg) => {
      const telegramId = msg.chat.id;
      await this.sendMessage(telegramId, `Hello!`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'PUSH ME!',
                web_app: {
                  url: `${process.env.PUBLIC_URL}`,
                },
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    });
  }

  private async ensureUserIsAdmin(msg: TelegramBot.Message) {
    const adminId = msg.chat.id;
    const user = await this.userService.user({
      telegramId: adminId,
      role: Role.ADMIN,
    });
    if (!user) {
      await this.sendMessage(adminId, 'You are not an admin');
      throw new UnauthenticatedError('Unauthorized');
    }
  }

  private async sendMessage(
    telegramId: number,
    message: string,
    options?: TelegramBot.SendMessageOptions,
  ) {
    try {
      await this.bot.sendMessage(telegramId, message, options);
    } catch (error) {
      console.error('Error sending message', error);
    }
  }

  // This method is only for development purposes
  // That code should never exist
  // Only for demonstration purposes
  // It is only to make demonstration easier
  private initDebugHandler() {
    if (!process.env.DEV_MODE) {
      return;
    }
    const RED_CODE = '\x1b[31m%s\x1b[0m';
    console.warn(
      RED_CODE,
      `!!!!! WARNING: DEV MODE FOR TELEGRAM BOT ENABLED !!!!!\nAny user may become an admin by typing /set_me_admin\nTo disable this behavior, set DEV_MODE=false in .env file\nYou must never enable this in production!\nThis backdoor is for development purposes only`,
    );
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DEV_MODE is enabled in production');
    }
    this.bot.onText(/\/getusers/, async (msg) => {
      try {
        await this.ensureUserIsAdmin(msg);
        const users = await this.userService.users();
        const message = users
          .map(
            (user) =>
              `${user.firstName} ${user.lastName} (${user.telegramId}) [${user.id}]`,
          )
          .join('\n');
        await this.sendMessage(msg.chat.id, message);
      } catch (error) {
        if (error instanceof UnauthenticatedError) {
          return;
        } else {
          throw error;
        }
      }
    });
    this.bot.onText(/\/set_me_admin/, async (msg) => {
      const telegramId = msg.chat.id;
      await this.userService.updateUser({
        where: { telegramId },
        data: { role: Role.ADMIN },
      });
      await this.sendMessage(telegramId, 'You are now an admin');
    });
    this.bot.onText(/\/set_me_user/, async (msg) => {
      const telegramId = msg.chat.id;
      await this.userService.updateUser({
        where: { telegramId },
        data: { role: Role.USER },
      });
      await this.sendMessage(telegramId, 'You are now an user');
    });
  }
}
