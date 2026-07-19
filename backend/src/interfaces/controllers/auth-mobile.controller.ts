/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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
      throw new BadRequestException(
        'El password debe tener al menos 6 caracteres',
      );
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

      this.logger.log(
        `Register success: email=${email}, clientId=${client.id}`,
      );

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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
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
    const emailClean = email?.trim().toLowerCase();

    if (!email || !password) {
      throw new UnauthorizedException('Email y password son requeridos');
    }

    this.logger.log(
      `[Login] Email recibido: "${email}" → limpiado: "${emailClean}"`,
    );

    // Buscar en mecanico por email
    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { email: emailClean },
    });

    if (mechanic) {
      this.logger.log(
        `[Login] Mecánico encontrado: id=${mechanic.id}, email="${mechanic.email}", clerkId=${mechanic.clerkId}, activo=${mechanic.activo}, passwordHash=${mechanic.passwordHash ? 'SI' : 'NO'}`,
      );

      // Si tiene passwordHash, verificar con bcrypt
      if (mechanic.passwordHash) {
        const valid = await bcrypt.compare(password, mechanic.passwordHash);
        this.logger.log(`[Login] bcrypt.compare: ${valid}`);
        if (!valid) {
          throw new UnauthorizedException('Credenciales incorrectas');
        }
      } else {
        // Mecánico sin passwordHash (creado por admin): primer login
        // Guardar el password que usa como hash para futuros logins
        this.logger.log(
          `[Login] Mecánico sin passwordHash → guardando password del primer login`,
        );
        const newHash = await bcrypt.hash(password, 10);
        await this.prisma.client$.mechanic.update({
          where: { id: mechanic.id },
          data: { passwordHash: newHash },
        });
      }

      const clerkId = mechanic.clerkId ?? crypto.randomUUID();
      if (!mechanic.clerkId) {
        await this.prisma.client$.mechanic.update({
          where: { id: mechanic.id },
          data: { clerkId },
        });
        this.logger.log(
          `[Login] Mecánico actualizado con nuevo clerkId: ${clerkId}`,
        );
      }

      const token = this.jwtService.signToken({
        sub: clerkId,
        role: 'mechanic',
        workshopId: mechanic.workshopId,
        name: mechanic.nombre,
      });

      this.logger.log(
        `[Login] JWT generado: sub=${clerkId}, role=mechanic, workshopId=${mechanic.workshopId}`,
      );

      return {
        success: true,
        token,
        userId: clerkId,
        role: 'mechanic',
        name: mechanic.nombre,
        workshopId: mechanic.workshopId,
      };
    }

    this.logger.log(
      `[Login] No se encontró mecánico con email "${emailClean}", buscando en clientes...`,
    );

    // Buscar en cliente por email
    const client = await this.prisma.client$.cliente.findFirst({
      where: { email: emailClean },
    });

    if (client) {
      this.logger.log(
        `[Login] Cliente encontrado: id=${client.id}, email="${client.email}", clerkId=${client.clerkId}, status=${client.status}, passwordHash=${client.passwordHash ? 'SI' : 'NO'}`,
      );

      if (!client.passwordHash) {
        // Cliente sin passwordHash (creado por admin): primer login
        // Guardar el password que usa como hash para futuros logins
        this.logger.log(
          `[Login] Cliente sin passwordHash → guardando password del primer login`,
        );
        const newHash = await bcrypt.hash(password, 10);
        await this.prisma.client$.cliente.update({
          where: { id: client.id },
          data: { passwordHash: newHash },
        });
        // No verificar bcrypt, ya sabemos que es correcto
      } else {
        const valid = await bcrypt.compare(password, client.passwordHash);
        this.logger.log(`[Login] bcrypt.compare: ${valid}`);
        if (!valid) {
          throw new UnauthorizedException('Credenciales incorrectas');
        }
      }

      const clerkId = client.clerkId ?? crypto.randomUUID();
      if (!client.clerkId) {
        await this.prisma.client$.cliente.update({
          where: { id: client.id },
          data: { clerkId },
        });
        this.logger.log(
          `[Login] Cliente actualizado con nuevo clerkId: ${clerkId}`,
        );
      }

      const token = this.jwtService.signToken({
        sub: clerkId,
        role: 'client',
        name: client.nombre,
      });

      this.logger.log(`[Login] JWT generado: sub=${clerkId}, role=client`);

      return {
        success: true,
        token,
        userId: clerkId,
        role: 'client',
        name: client.nombre,
      };
    }

    this.logger.warn(`[Login] Usuario no encontrado: "${emailClean}"`);
    throw new UnauthorizedException('Usuario no encontrado en el sistema');
  }
}
