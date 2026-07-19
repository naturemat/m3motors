/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EnviarNotificacion } from '../use-cases/EnviarNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';
import { AlertaGeneradaPayload } from '../../domain/events/AlertaGeneradaEvent';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class AlertaGeneradaHandler {
  private readonly logger = new Logger(AlertaGeneradaHandler.name);

  constructor(
    private readonly enviarNotificacion: EnviarNotificacion,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('alerta.generada')
  async handle(payload: AlertaGeneradaPayload): Promise<void> {
    this.logger.log(
      `Procesando alerta generada para vehiculo ${payload.vehicleId}`,
    );

    const vehicleId = parseInt(payload.vehicleId);

    // 1. Guardar alerta en DB
    try {
      const ultimaIntervencion = await this.prisma.client$.intervention.findFirst({
        where: { vehiculoId: vehicleId, estado: 'FINALIZADO' },
        orderBy: { fecha: 'desc' },
        select: { id: true },
      });

      if (!ultimaIntervencion) {
        this.logger.warn(`No se encontro intervencion para vehiculo ${vehicleId}, guardando alerta sin FK intervencion`);
      }

      const fechaEstimada = new Date();
      fechaEstimada.setDate(fechaEstimada.getDate() + payload.semanasEstimadasRestantes * 7);

      const kilometrajeProyectado = payload.kilometrajeActual + (payload.kilometrajeLimite - payload.kilometrajeActual);

      await this.prisma.client$.alertaPredictiva.create({
        data: {
          vehiculoId: vehicleId,
          intervencionId: ultimaIntervencion?.id ?? 1,
          componenteAfectado: payload.componenteAfectado,
          kilometrajeActual: payload.kilometrajeActual,
          kilometrajeLimite: payload.kilometrajeLimite,
          semanasEstimadas: payload.semanasEstimadasRestantes,
          mesesEstimados: payload.mesesEstimadosRestantes,
          mensajePrediccion: payload.mensajePrediccion,
          severidad: payload.nivelSeveridad,
          recomendacion: payload.recomendacion,
          estadoAlerta: 'pendiente',
          fechaEstimada,
          kilometrajeProyectado,
        },
      });

      this.logger.log(`Alerta guardada en DB: ${payload.componenteAfectado} [${payload.nivelSeveridad}] para vehiculo ${vehicleId}`);
    } catch (error) {
      this.logger.error(`Error guardando alerta en DB: ${String(error)}`);
    }

    // 2. Enviar notificacion (email)
    try {
      const cliente = await this.prisma.client$.cliente.findUnique({
        where: { id: parseInt(payload.clienteId) },
      });

      if (!cliente) {
        this.logger.warn(`Cliente ${payload.clienteId} no encontrado para notificacion`);
        return;
      }

      if (!cliente.email) {
        this.logger.warn(`Cliente ${payload.clienteId} sin email para notificacion`);
        return;
      }

      const asunto = `Alerta de mantenimiento: ${payload.componenteAfectado}`;
      const contenido = this.construirContenidoAlerta(payload);

      await this.enviarNotificacion.execute({
        clienteId: payload.clienteId,
        vehicleId: payload.vehicleId,
        tipo: TipoNotificacion.ALERTA_MANTENIMIENTO,
        canal: CanalEnvio.EMAIL,
        asunto,
        contenido,
        email: cliente.email,
        metadata: {
          placa: payload.placa,
          componenteAfectado: payload.componenteAfectado,
          kilometrajeActual: payload.kilometrajeActual,
          kilometrajeLimite: payload.kilometrajeLimite,
          semanasEstimadasRestantes: payload.semanasEstimadasRestantes,
          mesesEstimadosRestantes: payload.mesesEstimadosRestantes,
          nivelSeveridad: payload.nivelSeveridad,
          recomendacion: payload.recomendacion,
        },
      });
    } catch (error) {
      this.logger.error(`Error enviando notificacion: ${String(error)}`);
    }
  }

  private construirContenidoAlerta(payload: AlertaGeneradaPayload): string {
    const severidadColor = this.obtenerColorSeveridad(payload.nivelSeveridad);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${severidadColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .alert-box { background-color: white; border-left: 4px solid ${severidadColor}; padding: 15px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Alerta de Mantenimiento Predictivo</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <p><strong>Componente:</strong> ${payload.componenteAfectado}</p>
              <p><strong>Severidad:</strong> ${payload.nivelSeveridad}</p>
              <p><strong>Placa:</strong> ${payload.placa}</p>
              <p><strong>Kilometraje actual:</strong> ${payload.kilometrajeActual.toLocaleString()} km</p>
              <p><strong>Kilometraje limite:</strong> ${payload.kilometrajeLimite.toLocaleString()} km</p>
              <p><strong>Semanas estimadas restantes:</strong> ${payload.semanasEstimadasRestantes}</p>
              <p><strong>Meses estimados restantes:</strong> ${payload.mesesEstimadosRestantes}</p>
            </div>
            <p><strong>Prediccion:</strong> ${payload.mensajePrediccion}</p>
            <p><strong>Recomendacion:</strong> ${payload.recomendacion}</p>
            <p>Por favor, contacte al taller para programar su mantenimiento.</p>
          </div>
          <div class="footer">
            <p>M3Motors - Sistema de Mantenimiento Predictivo</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private obtenerColorSeveridad(nivel: string): string {
    switch (nivel) {
      case 'CRITICA':
        return '#e74c3c';
      case 'MEDIA':
        return '#f39c12';
      case 'BAJA':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  }
}
