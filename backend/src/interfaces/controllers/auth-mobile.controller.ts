/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, HttpCode, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';

@ApiTags('Auth Mobile')
@Controller('auth')
export class AuthMobileController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('login-mobile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login mobile - email + password, role desde BD' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async loginMobile(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email y password son requeridos');
    }

    const expectedPassword = `mobile_${email}_m3motors`;
    if (password !== expectedPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Buscar en mecanico por email
    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { email: email },
    });

    if (mechanic) {
      return {
        success: true,
        userId: mechanic.clerkId,
        role: 'mechanic',
        name: mechanic.nombre,
        workshopId: mechanic.workshopId,
      };
    }

    // Buscar en cliente por email
    const client = await this.prisma.client$.cliente.findFirst({
      where: { email: email },
    });

    if (client) {
      return {
        success: true,
        userId: client.clerkId,
        role: 'client',
        name: client.nombre,
      };
    }

    throw new UnauthorizedException('Usuario no encontrado en el sistema');
  }
}
