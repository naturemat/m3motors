/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  Inject,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ClientePreRegistradoEvent } from '../../registro-seguimiento/domain/events/ClientePreRegistradoEvent';
import { IDOMAIN_EVENT_PUBLISHER } from '../../shared/domain/ports/events/IDomainEventPublisher';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: any,
  ) {}

  @Get('workshop/:id')
  @ApiOperation({ summary: 'Obtener información pública del taller' })
  @ApiResponse({ status: 200, description: 'Datos del taller' })
  async getWorkshop(@Param('id') id: string) {
    const wk = await this.prisma.client$.workshop.findUnique({
      where: { id: Number(id) },
      include: { servicios: true },
    });
    if (!wk) return { workshop: null };
    return { workshop: wk };
  }

  @Post('workshop/:id/pre-register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Pre-registrar cliente' })
  @ApiResponse({ status: 201, description: 'Cliente pre-registrado' })
  async preRegister(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-recaptcha-token') recaptchaToken?: string,
  ) {
    const { nombre, telefono, email, licensePlate } = body;
    const workshopId = Number(id);

    // verify recaptcha if secret is configured
    try {
      const secret = process.env.RECAPTCHA_SECRET;
      if (secret) {
        if (!recaptchaToken)
          throw new BadRequestException('Missing recaptcha token');
        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', recaptchaToken);

        // node >=18 has global fetch

        const resp = await fetch(
          'https://www.google.com/recaptcha/api/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          },
        );

        const json = await resp.json();
        if (!json?.success) {
          throw new BadRequestException('Invalid recaptcha');
        }
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      console.error('Recaptcha verification failed', err);
      throw new BadRequestException('Recaptcha verification failed');
    }

    const pre = await this.prisma.client$.preRegisteredCustomer.create({
      data: {
        workshopId,
        nombre,
        telefono,
        email,
        licensePlate: licensePlate ?? null,
        status: 'PENDING',
      },
    });

    // publicar evento de dominio para notificaciones/handlers
    try {
      const evento = new ClientePreRegistradoEvent({
        preRegisteredCustomerId: String(pre.id),
        workshopId: String(workshopId),
        nombre: pre.nombre,
        telefono: pre.telefono,
        email: pre.email,
        licensePlate: pre.licensePlate ?? undefined,
      });
      await this.eventPublisher.publish(
        ClientePreRegistradoEvent.EVENT_NAME,
        evento.toPayload(),
      );
    } catch (err) {
      // no bloquear el flujo si falla el publisher
      console.error('Failed to publish pre-registered event', err);
    }

    return { preRegistered: pre };
  }
}
