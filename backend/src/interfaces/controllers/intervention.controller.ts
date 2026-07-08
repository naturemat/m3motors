/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { CreateInterventionDTO } from '../../application/dto/CreateInterventionDTO';

@ApiTags('Interventions')
@ApiBearerAuth()
@Controller('interventions')
@UseGuards(ClerkAuthGuard)
export class InterventionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar intervenciones con filtros' })
  @ApiQuery({ name: 'vehicleId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['BORRADOR', 'FINALIZADO'],
  })
  @ApiResponse({ status: 200, description: 'Lista de intervenciones' })
  async findAll(
    @Req() req: Request,
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: string,
  ) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { interventions: [] };
    }

    const where: Record<string, unknown> = {
      mecanicoId: mechanic.id,
    };

    if (vehicleId) {
      where.vehiculoId = parseInt(vehicleId);
    }

    if (status) {
      where.estado = status;
    }

    const interventions = await this.prisma.client$.intervention.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
        detalles: true,
      },
    });

    return { interventions };
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar una nueva intervención' })
  @ApiResponse({ status: 201, description: 'Intervención creada' })
  async create(@Body() dto: CreateInterventionDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { error: 'Mecánico no encontrado' };
    }

    const intervention = await this.prisma.client$.intervention.create({
      data: {
        vehiculoId: dto.vehiculoId,
        mecanicoId: mechanic.id,
        serviceCatalogId: dto.serviceCatalogId,
        fecha: new Date(),
        kilometrajeOdometro: dto.kilometrajeOdometro,
        diagnostico: dto.diagnostico,
        observaciones: dto.observaciones,
        severidad: dto.severidad,
        manoDeObra: dto.manoDeObra,
        estado: 'BORRADOR',
        detalles: dto.detalles
          ? {
              create: dto.detalles.map((d) => ({
                componenteReemplazado: d.componenteReemplazado,
                kilometrajeInstalacion: d.kilometrajeInstalacion,
                limiteKilometraje: d.limiteKilometraje,
                tipoServicio: d.tipoServicio,
              })),
            }
          : undefined,
      },
      include: { detalles: true },
    });

    return intervention;
  }
}
