import { Injectable } from '@nestjs/common';
import { TenantStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTenantDto) {
    return this.prisma.tenant.create({ data });
  }

  findAll() {
    return this.prisma.tenant.findMany({ orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateTenantDto) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.status !== undefined) updateData.status = data.status as TenantStatus;

    return this.prisma.tenant.update({ where: { id }, data: updateData });
  }

  delete(id: number) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
