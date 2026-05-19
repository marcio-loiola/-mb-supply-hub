import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(tenantId: number, dto: CreateProductDto) {
    const product = await this.productsRepository.create(tenantId, dto);
    return { data: product, message: 'Produto criado com sucesso' };
  }

  async findAll(tenantId: number) {
    const products = await this.productsRepository.findAll(tenantId);
    return { data: products, message: 'Produtos listados com sucesso' };
  }

  async findById(tenantId: number, id: number) {
    const product = await this.productsRepository.findById(tenantId, id);
    if (!product) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
    return { data: product, message: 'Produto encontrado' };
  }

  async update(tenantId: number, id: number, dto: UpdateProductDto) {
    await this.findById(tenantId, id);
    await this.productsRepository.update(tenantId, id, dto);
    const product = await this.productsRepository.findById(tenantId, id);
    return { data: product, message: 'Produto atualizado com sucesso' };
  }

  async remove(tenantId: number, id: number) {
    await this.findById(tenantId, id);
    await this.productsRepository.deactivate(tenantId, id);
    return { message: 'Produto desativado com sucesso' };
  }
}
