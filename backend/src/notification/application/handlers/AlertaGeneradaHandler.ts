import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EnviarNotificacion } from '../use-cases/EnviarNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';
import { AlertaGeneradaPayload } from '../../domain/events/AlertaGeneradaEvent';

@Injectable()
export class AlertaGeneradaHandler {
  private readonly logger = new Logger(AlertaGeneradaHandler.name);

  constructor(private readonly enviarNotificacion: EnviarNotificacion) {}

  @OnEvent('alerta.generada')
  async handle(payload: AlertaGeneradaPayload): Promise<void> {
    this.logger.log(
      `Procesando alerta generada para vehiculo ${payload.vehicleId}`,
    );

    const asunto = `Alerta de mantenimiento: ${payload.componenteAfectado}`;
    const contenido = this.construirContenidoAlerta(payload);

    await this.enviarNotificacion.execute({
      clienteId: payload.clienteId,
      vehicleId: payload.vehicleId,
      tipo: TipoNotificacion.ALERTA_MANTENIMIENTO,
      canal: CanalEnvio.EMAIL,
      asunto,
      contenido,
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
