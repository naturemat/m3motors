/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../../shared/infrastructure/auth/unified-auth.guard';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { ObtenerKPIsMecanico } from '../../application/use-cases/ObtenerKPIsMecanico';

@ApiTags('Mechanic Dashboard')
@ApiBearerAuth()
@Controller('mechanic/dashboard')
@UseGuards(UnifiedAuthGuard)
export class MechanicDashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerKPIs: ObtenerKPIsMecanico,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs del mecánico' })
  @ApiResponse({ status: 200, description: 'Métricas del mecánico' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;
    return this.obtenerKPIs.ejecutar(userId);
  }

  @Get('vehiculos')
  @ApiOperation({ summary: 'Vehículos asignados al mecánico' })
  async getVehiculos(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) return { vehiculos: [] };

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: { idMecanicoActivo: mechanic.id },
      include: {
        cliente: true,
        qr: true,
        alertas: {
          where: { estadoAlerta: { in: ['ACTIVA', 'PENDIENTE', 'activa', 'pendiente'] } },
        },
      },
    });

    return { vehiculos };
  }

  @Get('clientes-pendientes')
  @ApiOperation({ summary: 'Clientes pre-registrados pendientes' })
  async getClientesPendientes(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) return { clientes: [] };

    const clientes = await this.prisma.client$.preRegisteredCustomer.findMany({
      where: {
        workshopId: mechanic.workshopId,
        status: 'PENDING',
      },
    });

    return { clientes };
  }
}
