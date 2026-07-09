/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { UpdateAlertStatusDTO } from '../../application/dto/UpdateAlertStatusDTO';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(ClerkAuthGuard)
export class AlertController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas activas' })
  @ApiResponse({ status: 200, description: 'Lista de alertas' })
  async findActive(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { alerts: [] };
    }

    const alerts = await this.prisma.client$.alertaPredictiva.findMany({
      where: {
        estadoAlerta: { in: ['GENERADA', 'NOTIFICADA'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
      },
    });

    return { alerts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una alerta' })
  @ApiResponse({ status: 200, description: 'Detalle de la alerta' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const alert = await this.prisma.client$.alertaPredictiva.findUnique({
      where: { id },
      include: {
        vehiculo: { select: { placa: true, marca: true, modelo: true } },
        intervencion: {
          select: { diagnostico: true, observaciones: true },
        },
      },
    });

    if (!alert) {
      return { error: 'Alerta no encontrada' };
    }

    return alert;
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar o rechazar una alerta' })
  @ApiResponse({ status: 200, description: 'Alerta actualizada' })
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertStatusDTO,
  ) {
    const alert = await this.prisma.client$.alertaPredictiva.findUnique({
      where: { id },
    });

    if (!alert) {
      return { error: 'Alerta no encontrada' };
    }

    const updated = await this.prisma.client$.alertaPredictiva.update({
      where: { id },
      data: { estadoAlerta: dto.estadoAlerta },
    });

    return updated;
  }
}
