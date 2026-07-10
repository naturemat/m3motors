/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
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
import { ActivacionClienteService } from '../../registro-seguimiento/infrastructure/external-services/ActivacionClienteService';
import { ActivateClientDTO } from '../../application/dto/ActivateClientDTO';

@ApiTags('Activation')
@ApiBearerAuth()
@Controller('activation')
@UseGuards(ClerkAuthGuard)
export class ActivationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activacionService: ActivacionClienteService,
  ) {}

  @Post('activate-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activar cliente pre-registrado con fotos' })
  @ApiResponse({ status: 200, description: 'Cliente activado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async activateClient(@Body() dto: ActivateClientDTO, @Req() req: Request) {
    const { userId } = (req as any).auth;

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId: userId },
    });

    if (!mechanic) {
      throw new BadRequestException('Mecanico no encontrado');
    }

    const customerIdInt = parseInt(dto.customerId);

    const preRegisteredCustomer =
      await this.prisma.client$.preRegisteredCustomer.findUnique({
        where: { id: customerIdInt },
      });

    if (!preRegisteredCustomer) {
      throw new BadRequestException('Cliente pre-registrado no encontrado');
    }

    if (preRegisteredCustomer.status !== 'PENDING') {
      throw new BadRequestException(
        'El cliente no esta en estado pendiente de activacion',
      );
    }

    const fotoPlaca = dto.fotos.find((f) => f.tipo === 'placa');
    if (!fotoPlaca) {
      throw new BadRequestException(
        'Se requiere al menos una foto de tipo placa',
      );
    }

    const placaBuffer = Buffer.from(fotoPlaca.base64, 'base64');

    const resultado = await this.activacionService.ejecutar({
      clienteId: String(preRegisteredCustomer.id),
      preRegisteredCustomerId: dto.customerId,
      workshopId: dto.workshopId,
      mechanicId: String(mechanic.id),
      clienteNombre: preRegisteredCustomer.nombre,
      clienteTelefono: preRegisteredCustomer.telefono,
      clienteEmail: preRegisteredCustomer.email,
      fotoPlaca: placaBuffer,
      mimeType: 'image/jpeg',
      fotos: [],
      marca: dto.marca,
      modelo: dto.modelo,
      anio: dto.anio,
      tipoMotor: dto.tipoMotor,
    });

    await this.prisma.client$.preRegisteredCustomer.update({
      where: { id: customerIdInt },
      data: {
        status: 'ACTIVATED',
        fechaActivacion: new Date(),
        idMecanicoActivo: mechanic.id,
      },
    });

    return {
      success: true,
      vehicleId: resultado.vehicleId,
      placa: resultado.placa,
      qr: {
        codigo: resultado.qr.getCodigo(),
        url: resultado.qr.getUrl(),
      },
    };
  }
}
