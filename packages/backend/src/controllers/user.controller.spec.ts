import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import Prisma from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    userController = new UserController(userService);
  });

  describe('show', () => {
    it('should return a user if it exists', async () => {
      const result = { id: '1', firstName: 'Test' };
      jest
        .spyOn(userService, 'user')
        .mockImplementation(() => Promise.resolve(result as Prisma.User));

      expect(await userController.show('1')).toEqual(result);
    });

    it('should throw an error if the user does not exist', async () => {
      jest
        .spyOn(userService, 'user')
        .mockImplementation(() => Promise.resolve(null));

      await expect(userController.show('1')).rejects.toThrow('User not found');
    });
  });
});
