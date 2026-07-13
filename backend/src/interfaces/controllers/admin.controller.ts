/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import crypto from 'crypto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { CreateMechanicDTO } from '../../application/dto/CreateMechanicDTO';
import { CreateServiceDTO } from '../../application/dto/CreateServiceDTO';
import { UpdateWorkshopDTO } from '../../application/dto/UpdateWorkshopDTO';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(ClerkAuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPI del taller' })
  @ApiResponse({ status: 200, description: 'Métricas clave del taller' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
      include: {
        mecanicos: true,
        servicios: true,
        preRegisteredCustomers: true,
      },
    });

    if (!workshop) {
      return {
        kpis: {
          totalVehicles: 0,
          totalClientsActive: 0,
          monthlyRevenue: 0,
          avgMechanicRating: 0,
          servicesCount: 0,
        },
      };
    }

    const clientsActive = await this.prisma.client$.cliente.count({
      where: {
        idMecanicoActivo: { in: workshop.mecanicos.map((m: any) => m.id) },
        status: 'ACTIVATED',
      },
    });

    const vehicleCount = await this.prisma.client$.vehicle.count({
      where: {
        idMecanicoActivo: { in: workshop.mecanicos.map((m: any) => m.id) },
      },
    });

    const monthlyRevenue = await this.prisma.client$.intervention.aggregate({
      _sum: { manoDeObra: true },
      where: {
        mecanicoId: { in: workshop.mecanicos.map((m: any) => m.id) },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const avgMechanicRating = workshop.mecanicos.length
      ? workshop.mecanicos.reduce(
          (sum: number, mech: any) => sum + (mech.rating ?? 0),
          0,
        ) / workshop.mecanicos.length
      : 0;

    return {
      kpis: {
        totalVehicles: vehicleCount,
        totalClientsActive: clientsActive,
        monthlyRevenue: Number(monthlyRevenue._sum.manoDeObra ?? 0),
        avgMechanicRating: Number(avgMechanicRating.toFixed(2)),
        servicesCount: workshop.servicios.length,
      },
    };
  }

  @Get('workshop')
  @ApiOperation({ summary: 'Obtener configuración del taller' })
  @ApiResponse({ status: 200, description: 'Datos del taller' })
  async getWorkshop(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
      include: {
        mecanicos: true,
        servicios: true,
        preRegisteredCustomers: true,
      },
    });

    if (!workshop) {
      return { workshop: null };
    }

    return { workshop };
  }

  @Put('workshop')
  @ApiOperation({ summary: 'Actualizar configuración del taller' })
  @ApiResponse({ status: 200, description: 'Taller actualizado' })
  async updateWorkshop(@Req() req: Request, @Body() dto: UpdateWorkshopDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });

    if (!workshop) {
      return { error: 'Taller no encontrado' };
    }

    const updated = await this.prisma.client$.workshop.update({
      where: { id: workshop.id },
      data: {
        nombre: dto.nombre ?? workshop.nombre,
        direccion: dto.direccion ?? workshop.direccion,
        horarios: dto.horarios ?? workshop.horarios,
      },
    });

    return { workshop: updated };
  }

  @Get('mechanics')
  @ApiOperation({ summary: 'Listar mecánicos del taller' })
  @ApiResponse({ status: 200, description: 'Lista de mecánicos' })
  async getMechanics(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
    if (!workshop) return { mechanics: [] };

    const mechanics = await this.prisma.client$.mechanic.findMany({
      where: { workshopId: workshop.id },
    });
    return { mechanics };
  }

  @Post('mechanics')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar nuevo mecánico' })
  @ApiResponse({ status: 201, description: 'Mecánico creado' })
  async createMechanic(@Req() req: Request, @Body() dto: CreateMechanicDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
    if (!workshop) return { error: 'Taller no encontrado' };

    const mechanic = await this.prisma.client$.mechanic.create({
      data: {
        workshopId: workshop.id,
        clerkId: crypto.randomUUID(),
        nombre: dto.nombre,
        especialidad: dto.especialidad ?? null,
        activo: true,
        creadoPor: workshop.id,
      },
    });

    return { mechanic };
  }

  @Delete('mechanics/:id')
  @ApiOperation({ summary: 'Eliminar mecánico' })
  @ApiResponse({ status: 200, description: 'Mecánico eliminado' })
  async deleteMechanic(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
    if (!workshop) return { error: 'Taller no encontrado' };

    await this.prisma.client$.mechanic.deleteMany({
      where: { id, workshopId: workshop.id },
    });
    return { success: true };
  }

  @Get('services')
  @ApiOperation({ summary: 'Listar servicios del taller' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  async getServices(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
    if (!workshop) return { services: [] };

    const services = await this.prisma.client$.serviceCatalog.findMany({
      where: { workshopId: workshop.id },
    });
    return { services };
  }

  @Post('services')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar servicio al catálogo' })
  @ApiResponse({ status: 201, description: 'Servicio creado' })
  async createService(@Req() req: Request, @Body() dto: CreateServiceDTO) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
    });
    if (!workshop) return { error: 'Taller no encontrado' };

    const service = await this.prisma.client$.serviceCatalog.create({
      data: {
        workshopId: workshop.id,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        precioReferencia: dto.precioReferencia,
        categoria: dto.categoria ?? 'General',
      },
    });
    return { service };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Listar clientes y pre-registrados' })
  @ApiResponse({ status: 200, description: 'Clientes listados' })
  async getCustomers(@Req() req: Request) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
      include: { preRegisteredCustomers: true, mecanicos: true },
    });
    if (!workshop) return { activeClients: [], preRegistered: [] };

    const activeClients = await this.prisma.client$.cliente.findMany({
      where: {
        idMecanicoActivo: {
          in: workshop.mecanicos?.map((m: any) => m.id) ?? [],
        },
      },
    });

    return { activeClients, preRegistered: workshop.preRegisteredCustomers };
  }

  @Post('customers/:id/activate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activar cliente pre-registrado' })
  @ApiResponse({ status: 200, description: 'Cliente activado' })
  async activateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { userId } = (req as any).auth;
    const workshop = await this.prisma.client$.workshop.findFirst({
      where: { ownerId: userId },
      include: { mecanicos: true },
    });
    if (!workshop) return { error: 'Taller no encontrado' };

    const preClient = await this.prisma.client$.preRegisteredCustomer.findFirst(
      {
        where: { id, workshopId: workshop.id, status: 'PENDING' },
      },
    );
    if (!preClient) return { error: 'Cliente no encontrado o ya activado' };

    const mechanicId = workshop.mecanicos?.[0]?.id;
    if (!mechanicId) return { error: 'No hay mecánico activo disponible' };

    const cliente = await this.prisma.client$.cliente.create({
      data: {
        clerkId: crypto.randomUUID(),
        nombre: preClient.nombre,
        telefono: preClient.telefono,
        email: preClient.email,
        status: 'ACTIVATED',
        idMecanicoActivo: mechanicId,
      },
    });

    await this.prisma.client$.preRegisteredCustomer.update({
      where: { id: preClient.id },
      data: {
        status: 'ACTIVATED',
        fechaActivacion: new Date(),
        idClienteConverted: cliente.id,
      },
    });

    return { cliente };
  }
}
