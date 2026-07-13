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
  BadRequestException,
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
        detalles: { include: { partsCatalog: true } },
      },
    });

    return { interventions };
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar una nueva intervención' })
  @ApiResponse({ status: 201, description: 'Intervención creada exitosamente' })
  async create(@Body() dto: CreateInterventionDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      throw new BadRequestException('Mecánico no encontrado');
    }

    // 1. Validar si el vehículo existe y obtener su último kilometraje
    const vehiculo = await this.prisma.client$.vehiculo.findUnique({
      where: { id: dto.vehiculoId },
      select: { kilometrajeActual: true },
    });

    if (!vehiculo) {
      throw new BadRequestException('El vehículo especificado no existe.');
    }

    // 2. REQUERIMIENTO CRÍTICO: Validar que el kilometraje ingresado sea mayor al anterior
    if (dto.kilometrajeOdometro <= vehiculo.kilometrajeActual) {
      throw new BadRequestException(
        `El kilometraje ingresado (${dto.kilometrajeOdometro} km) debe ser estrictamente mayor al último registro (${vehiculo.kilometrajeActual} km).`,
      );
    }

    // 3. Guardar todo en una transacción atómica de Prisma
    const intervention = await this.prisma.client$.$transaction(
      async (tx: any) => {
        const createdIntervention = await tx.intervention.create({
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
            estado: 'FINALIZADO',
            tipoIntervencion: dto.tipoIntervencion ?? 'PREVENTIVO',
            detalles: dto.detalles
              ? {
                  create: dto.detalles.map((d) => ({
                    componenteReemplazado: d.componenteReemplazado,
                    kilometrajeInstalacion: dto.kilometrajeOdometro,
                    limiteKilometraje: d.limiteKilometraje,
                    tipoServicio: d.tipoServicio,
                    partsCatalogId: d.partsCatalogId ?? null,
                    marcaRepuesto: d.marcaRepuesto ?? null,
                    calidadRepuesto: d.calidadRepuesto ?? null,
                    observaciones: d.observaciones ?? null,
                    vidaUtilDiasEstimada: d.vidaUtilDiasEstimada ?? null,
                  })),
                }
              : undefined,
          },
          include: { detalles: { include: { partsCatalog: true } } },
        });

        // Actualizar el kilometraje actual en el Vehículo
        await tx.vehiculo.update({
          where: { id: dto.vehiculoId },
          data: { kilometrajeActual: dto.kilometrajeOdometro },
        });

        return createdIntervention;
      },
    );

    // 4. REQUERIMIENTO CRÍTICO: Lanzar evento de dominio IntervencionRegistrada
    console.log(
      `[Evento Dominio] IntervencionRegistrada disparado para ID: ${intervention.id}`,
    );

    return {
      mensaje: 'Servicio registrado exitosamente',
      intervention,
    };
  }
}
