import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(tenantId: number, dto: CreateUserDto) {
    const user = await this.usersRepository.create(tenantId, dto);
    return { data: user, message: 'Usuário criado com sucesso' };
  }

  async findAll(tenantId: number) {
    const users = await this.usersRepository.findAll(tenantId);
    return { data: users, message: 'Usuários listados com sucesso' };
  }

  async findById(tenantId: number, id: number) {
    const user = await this.usersRepository.findById(tenantId, id);
    if (!user) {
      throw new NotFoundException(`Usuário #${id} não encontrado`);
    }
    return { data: user, message: 'Usuário encontrado' };
  }

  async update(tenantId: number, id: number, dto: UpdateUserDto) {
    await this.findById(tenantId, id);
    await this.usersRepository.update(tenantId, id, dto);
    const user = await this.usersRepository.findById(tenantId, id);
    return { data: user, message: 'Usuário atualizado com sucesso' };
  }
}
