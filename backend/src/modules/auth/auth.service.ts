import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Busca o usuário em qualquer tenant pelo email
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, status: 'ACTIVE' },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    return {
      data: {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          tenantId: user.tenantId,
          name: user.name,
          email: user.email,
        },
      },
      message: 'Login realizado com sucesso',
    };
  }
}
