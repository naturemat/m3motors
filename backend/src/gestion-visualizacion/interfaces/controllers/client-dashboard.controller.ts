/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../../shared/infrastructure/auth/unified-auth.guard';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { ObtenerKPIsCliente } from '../../application/use-cases/ObtenerKPIsCliente';

@ApiTags('Client Dashboard')
@ApiBearerAuth()
@Controller('client/dashboard')
@UseGuards(UnifiedAuthGuard)
export class ClientDashboardController {
  private readonly logger = new Logger(ClientDashboardController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerKPIs: ObtenerKPIsCliente,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs del cliente' })
  @ApiResponse({ status: 200, description: 'Métricas del cliente' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[ClientKPIs] userId=${userId}`);
    const result = await this.obtenerKPIs.ejecutar(userId);
    this.logger.log(`[ClientKPIs] Result: ${JSON.stringify(result)}`);
    return result;
  }

  @Get('vehiculos')
  @ApiOperation({ summary: 'Vehículos del cliente' })
  async getVehiculos(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[ClientVehiculos] userId=${userId}`);

    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId: userId },
    });

    if (!cliente) {
      this.logger.warn(`[ClientVehiculos] Cliente no encontrado para userId=${userId}`);
      return { vehiculos: [] };
    }

    this.logger.log(`[ClientVehiculos] Cliente encontrado: id=${cliente.id}, email="${cliente.email}", status=${cliente.status}`);

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
          where: { estadoAlerta: { in: ['ACTIVA', 'PENDIENTE', 'activa', 'pendiente'] } },
        },
      },
    });

    this.logger.log(`[ClientVehiculos] Vehículos encontrados: ${vehiculos.length}`);
    vehiculos.forEach(v => {
      this.logger.log(`  → id=${v.id}, placa=${v.placa}, marca=${v.marca}, modelo=${v.modelo}, status=${v.status}, intervenciones=${v.intervenciones.length}`);
    });

    return { vehiculos };
  }

  @Get('historial')
  @ApiOperation({ summary: 'Historial de intervenciones del cliente' })
  async getHistorial(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[ClientHistorial] userId=${userId}`);

    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId: userId },
    });

    if (!cliente) {
      this.logger.warn(`[ClientHistorial] Cliente no encontrado`);
      return { historial: [] };
    }

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: { clienteId: cliente.id },
      select: { id: true },
    });

    const vehicleIds = vehiculos.map((v) => v.id);
    this.logger.log(`[ClientHistorial] Vehículos del cliente: ${vehicleIds.length} → IDs: [${vehicleIds.join(', ')}]`);

    const historial = await this.prisma.client$.intervention.findMany({
      where: { vehiculoId: { in: vehicleIds } },
      orderBy: { fecha: 'desc' },
      include: {
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
        mecanico: { select: { nombre: true } },
        fotos: true,
      },
    });

    this.logger.log(`[ClientHistorial] Intervenciones encontradas: ${historial.length}`);
    historial.forEach(i => {
      this.logger.log(`  → id=${i.id}, fecha=${i.fecha?.toISOString()}, estado=${i.estado}, vehiculo=${i.vehiculo?.placa ?? 'N/A'}, mecanico=${i.mecanico?.nombre ?? 'N/A'}`);
    });

    return { historial };
  }
}
