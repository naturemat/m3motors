import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { ObtenerKPIsCliente } from '../../application/use-cases/ObtenerKPIsCliente';

@ApiTags('Client Dashboard')
@ApiBearerAuth()
@Controller('client/dashboard')
@UseGuards(ClerkAuthGuard)
export class ClientDashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerKPIs: ObtenerKPIsCliente,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs del cliente' })
  @ApiResponse({ status: 200, description: 'Métricas del cliente' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;
    return this.obtenerKPIs.ejecutar(userId);
  }

  @Get('vehiculos')
  @ApiOperation({ summary: 'Vehículos del cliente' })
  async getVehiculos(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId: userId },
    });

    if (!cliente) return { vehiculos: [] };

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: { clienteId: cliente.id },
      include: {
        qr: true,
        intervenciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
          include: { mecanico: true },
        },
        alertas: {
          where: { estadoAlerta: { in: ['ACTIVA', 'PENDIENTE'] } },
        },
      },
    });

    return { vehiculos };
  }

  @Get('historial')
  @ApiOperation({ summary: 'Historial de intervenciones del cliente' })
  async getHistorial(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId: userId },
    });

    if (!cliente) return { historial: [] };

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: { clienteId: cliente.id },
      select: { id: true },
    });

    const vehicleIds = vehiculos.map((v) => v.id);

    const historial = await this.prisma.client$.intervention.findMany({
      where: { vehiculoId: { in: vehicleIds } },
      orderBy: { fecha: 'desc' },
      include: {
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
        mecanico: { select: { nombre: true } },
        fotos: true,
      },
    });

    return { historial };
  }
}
