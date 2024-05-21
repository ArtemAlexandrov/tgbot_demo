import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Role, User } from '@prisma/client';
import type { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  public async upsertUser({
    telegramId,
    ...data
  }: Omit<Prisma.UserCreateInput, 'role'>) {
    return this.prisma.user.upsert({
      where: { telegramId },
      update: data,
      create: { telegramId, ...data, role: Role.USER },
    });
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  public async users({
    skip,
    take,
    where,
    orderBy,
    cursor,
  }: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereUniqueInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    cursor?: Prisma.UserWhereUniqueInput;
  } = {}): Promise<User[]> {
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      cursor,
    });
  }

  async updateUser({
    data,
    where,
  }: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    return this.prisma.user.update({
      data,
      where,
    });
  }
}
