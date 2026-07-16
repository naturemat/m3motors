/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ClerkAuthGuard } from '../../shared/infrastructure/clerk/clerk.guard';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { CreateVehicleDTO } from '../../application/dto/CreateVehicleDTO';
import { ObtenerHistorialVehiculo } from '../../registro-seguimiento/application/use-cases/ObtenerHistorialVehiculo';
import { QRServiceImpl } from '../../registro-seguimiento/infrastructure/external-services/QRServiceImpl';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(ClerkAuthGuard)
export class VehicleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerHistorial: ObtenerHistorialVehiculo,
    private readonly qrService: QRServiceImpl,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar vehículos del taller' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  async findAll(@Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { vehicles: [] };
    }

    const vehicles = await this.prisma.client$.vehicle.findMany({
      where: { idMecanicoActivo: mechanic.id },
      include: { qr: true, fotos: true },
    });

    return { vehicles };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil completo de un vehículo' })
  @ApiResponse({ status: 200, description: 'Perfil del vehículo con timeline' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: {
        qr: true,
        fotos: true,
        intervenciones: {
          orderBy: { fecha: 'desc' },
          include: { detalles: true },
        },
        alertas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return { error: 'Vehículo no encontrado' };
    }

    return vehicle;
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Obtener historial completo por QR' })
  @ApiResponse({ status: 200, description: 'Historial del vehiculo' })
  @ApiResponse({ status: 404, description: 'QR no valido' })
  async findByQr(@Param('qrCode') qrCode: string) {
    const historial = await this.obtenerHistorial.execute(qrCode);

    if (!historial) {
      return { error: 'Codigo QR no valido. Intenta nuevamente.' };
    }

    return historial;
  }

  @Get(':id/qr-image')
  @ApiOperation({ summary: 'Obtener imagen QR del vehículo' })
  @ApiResponse({ status: 200, description: 'Imagen QR en base64' })
  @ApiResponse({ status: 404, description: 'Vehículo sin QR' })
  async getQrImage(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.prisma.client$.vehicle.findUnique({
      where: { id },
      include: { qr: true },
    });

    if (!vehicle?.qr) {
      return { error: 'Vehículo no tiene código QR generado' };
    }

    const imagen = await this.qrService.generarImagenQR(vehicle.qr.codigo);

    return {
      vehicleId: id,
      qrCode: vehicle.qr.codigo,
      qrUrl: vehicle.qr.url,
      qrImage: imagen,
    };
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado' })
  async create(@Body() dto: CreateVehicleDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      return { error: 'Mecánico no encontrado' };
    }

    const vehicle = await this.prisma.client$.vehicle.create({
      data: {
        placa: dto.placa,
        marca: dto.marca,
        modelo: dto.modelo,
        anio: dto.anio,
        tipoMotor: dto.tipoMotor,
        status: 'PENDING',
        ultimoKilometraje: 0,
        clienteId: 1,
        idMecanicoActivo: mechanic.id,
      },
    });

    return vehicle;
  }
}
