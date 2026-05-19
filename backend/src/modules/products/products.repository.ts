import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: number, data: CreateProductDto) {
    return this.prisma.product.create({
      data: { tenantId, ...data },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { id: 'asc' },
    });
  }

  findById(tenantId: number, id: number) {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
    });
  }

  update(tenantId: number, id: number, data: UpdateProductDto) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status as ProductStatus;

    return this.prisma.product.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
  }

  deactivate(tenantId: number, id: number) {
    return this.prisma.product.updateMany({
      where: { id, tenantId },
      data: { status: 'INACTIVE' },
    });
  }
}
