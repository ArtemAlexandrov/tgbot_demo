import { TelegramBotService } from './telegram-bot.service';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import * as TelegramBot from 'node-telegram-bot-api';

jest.mock('./user.service');
jest.mock('./prisma.service');
jest.mock('node-telegram-bot-api');

describe('TelegramBotService', () => {
  let service: TelegramBotService;
  let userService: jest.Mocked<UserService>;
  let bot: jest.Mocked<TelegramBot>;

  beforeEach(() => {
    userService = new UserService(new PrismaService()) as any;
    bot = new TelegramBot('token', { polling: true }) as any;
    service = new TelegramBotService(userService);
    (service as any).bot = bot;
  });

  describe('onModuleInit', () => {
    it('should initialize commands', () => {
      const spy = jest.spyOn(service as any, 'initializeCommands');
      service.onModuleInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop bot polling', async () => {
      const spy = jest.spyOn(bot, 'stopPolling');
      await service.onModuleDestroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should handle error when stopping bot polling', async () => {
      const error = new Error('stopPolling error');
      bot.stopPolling.mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await service.onModuleDestroy();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error stopping bot polling',
        error,
      );
      consoleSpy.mockRestore();
    });
  });
});
