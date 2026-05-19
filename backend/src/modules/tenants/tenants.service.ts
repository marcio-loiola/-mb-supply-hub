import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async create(dto: CreateTenantDto) {
    const tenant = await this.tenantsRepository.create(dto);
    return { data: tenant, message: 'Tenant criado com sucesso' };
  }

  async findAll() {
    const tenants = await this.tenantsRepository.findAll();
    return { data: tenants, message: 'Tenants listados com sucesso' };
  }

  async findById(id: number) {
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant #${id} não encontrado`);
    }
    return { data: tenant, message: 'Tenant encontrado' };
  }

  async update(id: number, dto: UpdateTenantDto) {
    await this.findById(id);
    const tenant = await this.tenantsRepository.update(id, dto);
    return { data: tenant, message: 'Tenant atualizado com sucesso' };
  }

  async remove(id: number) {
    await this.findById(id);
    const tenant = await this.tenantsRepository.delete(id);
    return { data: tenant, message: 'Tenant desativado com sucesso' };
  }
}
