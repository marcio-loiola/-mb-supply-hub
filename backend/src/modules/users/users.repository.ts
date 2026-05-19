import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: number, data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  findById(tenantId: number, id: number) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(tenantId: number, id: number, data: UpdateUserDto) {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
  }
}
