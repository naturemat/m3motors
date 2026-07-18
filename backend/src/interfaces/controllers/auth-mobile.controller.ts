import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { MobileJwtService } from '../../shared/infrastructure/auth/jwt.service';

@ApiTags('Auth Mobile')
@Controller('auth')
export class AuthMobileController {
  private readonly logger = new Logger(AuthMobileController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: MobileJwtService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registro de cliente mobile' })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      nombre: string;
      telefono: string;
      workshopId?: number;
    },
  ) {
    const { email, password, nombre, telefono, workshopId } = body;

    this.logger.log(`Register attempt: email=${email}`);

    if (!email || !password || !nombre || !telefono) {
      throw new BadRequestException(
        'Email, password, nombre y telefono son requeridos',
      );
    }

    if (password.length < 6) {
      throw new BadRequestException('El password debe tener al menos 6 caracteres');
    }

    try {
      const existing = await this.prisma.client$.cliente.findUnique({
        where: { email },
      });

      if (existing) {
        throw new ConflictException('Este email ya esta registrado');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const clerkId = crypto.randomUUID();

      let assignedWorkshopId = workshopId;
      if (!assignedWorkshopId) {
        const workshop = await this.prisma.client$.workshop.findFirst();
        if (!workshop) {
          throw new BadRequestException('No hay talleres disponibles');
        }
        assignedWorkshopId = workshop.id;
      }

      const mechanic = await this.prisma.client$.mechanic.findFirst({
        where: { workshopId: assignedWorkshopId, activo: true },
      });

      const client = await this.prisma.client$.cliente.create({
        data: {
          clerkId,
          passwordHash,
          nombre,
          telefono,
          email,
          status: 'ACTIVATED',
          ...(mechanic ? { idMecanicoActivo: mechanic.id } : {}),
        },
      });

      const token = this.jwtService.signToken({
        sub: clerkId,
        role: 'client',
        workshopId: assignedWorkshopId,
        name: client.nombre,
      });

      this.logger.log(`Register success: email=${email}, clientId=${client.id}`);

      return {
        success: true,
        token,
        user: {
          userId: clerkId,
          role: 'client' as const,
          name: client.nombre,
          email: client.email,
          workshopId: assignedWorkshopId,
        },
      };
    } catch (error) {
      this.logger.error(`Register error: ${String(error)}`);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al registrar: ${String(error)}`);
    }
  }

  @Post('login-mobile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login mobile - email + password con JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async loginMobile(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Email y password son requeridos');
    }

    // Buscar en mecanico por email
    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { email },
    });

    if (mechanic) {
      // Si tiene passwordHash, verificar con bcrypt
      if (mechanic.passwordHash) {
        const valid = await bcrypt.compare(password, mechanic.passwordHash);
        if (!valid) {
          throw new UnauthorizedException('Credenciales incorrectas');
        }
      } else {
        // Backward compat: mecanicos creados por Clerk sin password local
        // Permitir login sin password verificar (temporal, se eliminara)
        // Por ahora, si no tiene password, no puede loguear
        throw new UnauthorizedException(
          'Cuenta sin configurar. Contacta al administrador.',
        );
      }

      const clerkId = mechanic.clerkId ?? crypto.randomUUID();
      if (!mechanic.clerkId) {
        await this.prisma.client$.mechanic.update({
          where: { id: mechanic.id },
          data: { clerkId },
        });
      }

      const token = this.jwtService.signToken({
        sub: clerkId,
        role: 'mechanic',
        workshopId: mechanic.workshopId,
        name: mechanic.nombre,
      });

      return {
        success: true,
        token,
        userId: clerkId,
        role: 'mechanic',
        name: mechanic.nombre,
        workshopId: mechanic.workshopId,
      };
    }

    // Buscar en cliente por email
    const client = await this.prisma.client$.cliente.findFirst({
      where: { email },
    });

    if (client) {
      if (!client.passwordHash) {
        throw new UnauthorizedException(
          'Cuenta sin configurar. Contacta al administrador.',
        );
      }

      const valid = await bcrypt.compare(password, client.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const clerkId = client.clerkId ?? crypto.randomUUID();
      if (!client.clerkId) {
        await this.prisma.client$.cliente.update({
          where: { id: client.id },
          data: { clerkId },
        });
      }

      const token = this.jwtService.signToken({
        sub: clerkId,
        role: 'client',
        name: client.nombre,
      });

      return {
        success: true,
        token,
        userId: clerkId,
        role: 'client',
        name: client.nombre,
      };
    }

    throw new UnauthorizedException('Usuario no encontrado en el sistema');
  }
}
