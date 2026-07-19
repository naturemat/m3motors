/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Post, UseGuards, Req, HttpCode, Logger } from '@nestjs/common';
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
import { EvaluacionDiariaHandler } from '../../../prediccion-analisis/infrastructure/handlers/EvaluacionDiariaHandler';

@ApiTags('Mechanic Dashboard')
@ApiBearerAuth()
@Controller('mechanic/dashboard')
@UseGuards(UnifiedAuthGuard)
export class MechanicDashboardController {
  private readonly logger = new Logger(MechanicDashboardController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerKPIs: ObtenerKPIsMecanico,
    private readonly evaluacionHandler: EvaluacionDiariaHandler,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs del mecánico' })
  @ApiResponse({ status: 200, description: 'Métricas del mecánico' })
  async getKpis(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[MechanicKPIs] userId=${userId}`);
    const result = await this.obtenerKPIs.ejecutar(userId);
    this.logger.log(`[MechanicKPIs] Result: ${JSON.stringify(result)}`);
    return result;
  }

  @Get('vehiculos')
  @ApiOperation({ summary: 'Vehículos asignados al mecánico' })
  async getVehiculos(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[MechanicVehiculos] userId=${userId}`);

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      this.logger.warn(`[MechanicVehiculos] Mecánico no encontrado para userId=${userId}`);
      return { vehiculos: [] };
    }

    this.logger.log(`[MechanicVehiculos] Mecánico encontrado: id=${mechanic.id}, workshopId=${mechanic.workshopId}`);

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

    this.logger.log(`[MechanicVehiculos] Vehículos encontrados: ${vehiculos.length}`);
    if (vehiculos.length > 0) {
      vehiculos.forEach(v => {
        this.logger.log(`  → id=${v.id}, placa=${v.placa}, marca=${v.marca}, modelo=${v.modelo}, status=${v.status}, cliente=${v.cliente?.nombre ?? 'N/A'}`);
      });
    }

    return { vehiculos };
  }

  @Get('clientes-pendientes')
  @ApiOperation({ summary: 'Clientes del taller' })
  async getClientesPendientes(@Req() req: Request) {
    const { userId } = (req as any).auth;
    this.logger.log(`[MechanicClientes] userId=${userId}`);

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      this.logger.warn(`[MechanicClientes] Mecánico no encontrado`);
      return { clientes: [] };
    }

    // Get all mechanics in this workshop to find all clients
    const workshopMechanics = await this.prisma.client$.mechanic.findMany({
      where: { workshopId: mechanic.workshopId },
      select: { id: true },
    });
    const mechanicIds = workshopMechanics.map((m: any) => m.id);

    // Return ALL clients in the workshop
    const clientes = await this.prisma.client$.cliente.findMany({
      where: {
        idMecanicoActivo: { in: mechanicIds },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        status: true,
        vehiculos: {
          select: { placa: true, marca: true, modelo: true },
        },
      },
    });

    this.logger.log(`[MechanicClientes] Clientes encontrados: ${clientes.length}`);
    return { clientes };
  }

  @Get('clients')
  @ApiOperation({ summary: 'Clientes activos del taller (para asociar vehículos)' })
  async getClients(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) return { clients: [] };

    // Get all mechanics in this workshop
    const workshopMechanics = await this.prisma.client$.mechanic.findMany({
      where: { workshopId: mechanic.workshopId },
      select: { id: true },
    });
    const mechanicIds = workshopMechanics.map((m: any) => m.id);

    const clients = await this.prisma.client$.cliente.findMany({
      where: { idMecanicoActivo: { in: mechanicIds } },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
      },
    });

    return { clients };
  }

  @Get('services')
  @ApiOperation({ summary: 'Catálogo de servicios del taller (para crear intervenciones)' })
  async getServices(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) return { services: [] };

    const services = await this.prisma.client$.serviceCatalog.findMany({
      where: { workshopId: mechanic.workshopId, activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        categoria: true,
        precioReferencia: true,
      },
    });

    return { services };
  }

  @Post('run-prediction')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ejecutar predicción manual (reemplaza cron)' })
  @ApiResponse({ status: 200, description: 'Predicción ejecutada' })
  async runPrediction() {
    this.logger.log('Ejecutando predicción manual...');
    await this.evaluacionHandler.ejecutar();
    return { mensaje: 'Predicción ejecutada exitosamente' };
  }
}
