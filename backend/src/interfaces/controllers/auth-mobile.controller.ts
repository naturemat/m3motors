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
  @ApiOperation({ summary: 'Login mobile sin Clerk (email + password)' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async loginMobile(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email y password son requeridos');
    }

    // Password esperado: mobile_[email]_m3motors
    const expectedPassword = `mobile_${email}_m3motors`;
    if (password !== expectedPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Buscar por email en mecanico
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

    // Buscar por email en cliente
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

    throw new UnauthorizedException('Usuario no encontrado');
  }
}
