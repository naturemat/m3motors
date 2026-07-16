/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { ClerkService } from '../../shared/infrastructure/clerk/clerk.service';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ActivacionClienteService } from '../../registro-seguimiento/infrastructure/external-services/ActivacionClienteService';
import { ActivateClientDTO } from '../../application/dto/ActivateClientDTO';

@ApiTags('Activation')
@ApiBearerAuth()
@Controller('activation')
@UseGuards(ClerkAuthGuard)
export class ActivationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activacionService: ActivacionClienteService,
    private readonly clerkService: ClerkService,
  ) {}

  @Get('pre-registered')
  @ApiOperation({ summary: 'Buscar clientes pre-registrados' })
  @ApiResponse({ status: 200, description: 'Lista de clientes encontrados' })
  async searchPreRegistered(
    @Req() req: Request,
    @Query('q') query?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      throw new BadRequestException('Mecanico no encontrado');
    }

    const workshopId = mechanic.workshopId;
    const skipNum = Math.max(0, skip ? parseInt(skip, 10) || 0 : 0);
    const takeNum = Math.min(
      100,
      Math.max(1, take ? parseInt(take, 10) || 20 : 20),
    );

    const whereClause: Record<string, unknown> = { workshopId };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const trimmedQuery = query?.trim();
    if (trimmedQuery) {
      whereClause.OR = [
        { nombre: { contains: trimmedQuery, mode: 'insensitive' } },
        { telefono: { contains: trimmedQuery, mode: 'insensitive' } },
        { licensePlate: { contains: trimmedQuery, mode: 'insensitive' } },
      ];
    }

    let orderByClause: Record<string, 'asc' | 'desc'> = {
      fechaPreRegistro: 'desc',
    };
    if (orderBy === 'name_asc') {
      orderByClause = { nombre: 'asc' };
    } else if (orderBy === 'name_desc') {
      orderByClause = { nombre: 'desc' };
    }

    const total = await this.prisma.client$.preRegisteredCustomer.count({
      where: whereClause,
    });

    const customers = await this.prisma.client$.preRegisteredCustomer.findMany({
      where: whereClause,
      skip: skipNum,
      take: takeNum,
      orderBy: orderByClause,
    });

    return {
      data: customers,
      meta: {
        total,
        skip: skipNum,
        take: takeNum,
      },
    };
  }

  @Post('activate-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activar cliente pre-registrado con fotos' })
  @ApiResponse({ status: 200, description: 'Cliente activado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async activateClient(@Body() dto: ActivateClientDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      throw new BadRequestException('Mecanico no encontrado');
    }

    const customerIdInt = parseInt(dto.customerId);

    const preRegisteredCustomer =
      await this.prisma.client$.preRegisteredCustomer.findUnique({
        where: { id: customerIdInt },
      });

    if (!preRegisteredCustomer) {
      throw new BadRequestException('Cliente pre-registrado no encontrado');
    }

    if (preRegisteredCustomer.status !== 'PENDING') {
      throw new BadRequestException(
        'El cliente no esta en estado pendiente de activacion',
      );
    }

    const fotoPlaca = dto.fotos.find((f) => f.tipo === 'placa');
    if (!fotoPlaca) {
      throw new BadRequestException(
        'Se requiere al menos una foto de tipo placa',
      );
    }

    const placaBuffer = Buffer.from(fotoPlaca.base64, 'base64');

    const resultado = await this.activacionService.ejecutar({
      clienteId: String(preRegisteredCustomer.id),
      preRegisteredCustomerId: dto.customerId,
      workshopId: dto.workshopId,
      mechanicId: String(mechanic.id),
      clienteNombre: preRegisteredCustomer.nombre,
      clienteTelefono: preRegisteredCustomer.telefono,
      clienteEmail: preRegisteredCustomer.email,
      fotoPlaca: placaBuffer,
      mimeType: 'image/jpeg',
      fotos: [],
      marca: dto.marca,
      modelo: dto.modelo,
      anio: dto.anio,
      tipoMotor: dto.tipoMotor,
    });

    await this.prisma.client$.preRegisteredCustomer.update({
      where: { id: customerIdInt },
      data: {
        status: 'ACTIVATED',
        fechaActivacion: new Date(),
        idMecanicoActivo: mechanic.id,
      },
    });

    // Create Clerk user for the client
    const tempPassword = this.generateTempPassword();
    let clerkUserId: string | null = null;

    try {
      const workshop = await this.prisma.client$.workshop.findFirst({
        where: { id: dto.workshopId },
      });

      if (workshop?.clerkOrgId) {
        const clerkUser = await this.clerkService.createUser({
          email: preRegisteredCustomer.email,
          password: tempPassword,
          firstName: preRegisteredCustomer.nombre,
          publicMetadata: { role: 'client' },
        });

        clerkUserId = clerkUser.id;

        // Add to organization as member
        await this.clerkService.addMemberToOrganization(
          workshop.clerkOrgId,
          clerkUser.id,
          'org:member',
        );
      }
    } catch (error) {
      // Log error but don't fail the activation
      console.error('[Activation] Error creating Clerk user:', error);
    }

    return {
      success: true,
      vehicleId: resultado.vehicleId,
      placa: resultado.placa,
      qr: {
        codigo: resultado.qr.getCodigo(),
        url: resultado.qr.getUrl(),
      },
      tempPassword: clerkUserId ? tempPassword : undefined,
    };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
