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
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../shared/infrastructure/auth/unified-auth.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { SupabaseStorageService } from '../../shared/infrastructure/storage/supabase-storage.service';
import { CreateInterventionDTO } from '../../application/dto/CreateInterventionDTO';
import { NotificationService } from '../../notification/notification.service';

@ApiTags('Interventions')
@ApiBearerAuth()
@Controller('interventions')
@UseGuards(UnifiedAuthGuard)
export class InterventionController {
  private readonly logger = new Logger(InterventionController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
    private readonly notificationService: NotificationService,
  ) {}

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
        fotos: true,
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
    const vehiculo = await this.prisma.client$.vehicle.findUnique({
      where: { id: dto.vehiculoId },
      select: { ultimoKilometraje: true },
    });

    if (!vehiculo) {
      throw new BadRequestException('El vehículo especificado no existe.');
    }

    // 2. REQUERIMIENTO CRÍTICO: Validar que el kilometraje ingresado sea mayor al anterior
    if (dto.kilometrajeOdometro <= vehiculo.ultimoKilometraje) {
      throw new BadRequestException(
        `El kilometraje ingresado (${dto.kilometrajeOdometro} km) debe ser estrictamente mayor al último registro (${vehiculo.ultimoKilometraje} km).`,
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
          include: {
            detalles: { include: { partsCatalog: true } },
            fotos: true,
          },
        });

        // Actualizar el kilometraje actual en el Vehículo
        await tx.vehicle.update({
          where: { id: dto.vehiculoId },
          data: { ultimoKilometraje: dto.kilometrajeOdometro },
        });

        return createdIntervention;
      },
    );

    // 4. Subir fotos a Supabase Storage si existen
    if (dto.fotos && dto.fotos.length > 0) {
      const maxPhotos = 10;
      const photosToUpload = dto.fotos.slice(0, maxPhotos);

      const photoPromises = photosToUpload.map(async (foto) => {
        try {
          const url = await this.storageService.uploadImage(
            foto.base64,
            foto.mimeType,
            `interventions/${intervention.id}`,
          );

          return this.prisma.client$.interventionPhoto.create({
            data: {
              intervencionId: intervention.id,
              url,
              tipo: foto.tipo,
              descripcion: foto.descripcion ?? null,
            },
          });
        } catch (error) {
          this.logger.error(`Error uploading photo: ${String(error)}`);
          return null;
        }
      });

      await Promise.allSettled(photoPromises);

      // Fetch intervention with photos
      const interventionWithPhotos =
        await this.prisma.client$.intervention.findUnique({
          where: { id: intervention.id },
          include: {
            detalles: { include: { partsCatalog: true } },
            fotos: true,
          },
        });

      return {
        mensaje: 'Servicio registrado exitosamente',
        intervention: interventionWithPhotos,
      };
    }

    // 4. Enviar notificacion al cliente
    try {
      const vehiculo = await this.prisma.client$.vehicle.findUnique({
        where: { id: dto.vehiculoId },
        select: { clienteId: true },
      });

      if (vehiculo?.clienteId) {
        const cliente = await this.prisma.client$.cliente.findUnique({
          where: { id: vehiculo.clienteId },
          select: { id: true, email: true, nombre: true },
        });

        if (cliente) {
          await this.notificationService.enviarAsync(
            {
              clienteId: cliente.id,
              email: cliente.email,
              tipo: 'INTERVENCION_CREADA' as any,
              canal: 'email' as any,
              asunto: 'Servicio registrado en tu vehiculo',
              contenido: `Se ha registrado un servicio de tipo ${intervention.tipoIntervencion} en tu vehiculo. Diagnostico: ${intervention.diagnostico ?? 'Sin diagnostico'}`,
              metadata: { intervencionId: intervention.id, vehiculoId: dto.vehiculoId },
            },
            cliente.email,
          );
        }
      }
    } catch (notifError) {
      this.logger.error(`Error enviando notificacion: ${String(notifError)}`);
    }

    return {
      mensaje: 'Servicio registrado exitosamente',
      intervention,
    };
  }
}
