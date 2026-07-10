import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EnviarNotificacion } from '../use-cases/EnviarNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';
import { ClienteActivadoPayload } from '../../domain/events/ClienteActivadoEvent';

@Injectable()
export class ClienteActivadoHandler {
  private readonly logger = new Logger(ClienteActivadoHandler.name);

  constructor(private readonly enviarNotificacion: EnviarNotificacion) {}

  @OnEvent('cliente.activado')
  async handle(payload: ClienteActivadoPayload): Promise<void> {
    this.logger.log(
      `Enviando email de bienvenida a cliente ${payload.clienteId}`,
    );

    const asunto = 'Bienvenido a M3Motors';
    const contenido = this.construirContenidoBienvenida(payload.nombre);

    await this.enviarNotificacion.execute({
      clienteId: payload.clienteId,
      tipo: TipoNotificacion.BIENVENIDA,
      canal: CanalEnvio.EMAIL,
      asunto,
      contenido,
      email: payload.email,
      metadata: {
        preRegisteredCustomerId: payload.preRegisteredCustomerId,
        workshopId: payload.workshopId,
        mechanicId: payload.mechanicId,
        email: payload.email,
        telefono: payload.telefono,
        fechaActivacion: payload.fechaActivacion,
      },
    });
  }

  private construirContenidoBienvenida(nombre: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a2e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenido a M3Motors</h1>
          </div>
          <div class="content">
            <p>Hola ${nombre},</p>
            <p>Su cuenta ha sido activada exitosamente.</p>
            <p>Ahora podra recibir alertas de mantenimiento predictivo y recomendaciones para su vehiculo.</p>
            <p>Saludos,<br/>El equipo de M3Motors</p>
          </div>
          <div class="footer">
            <p>M3Motors - Sistema de Mantenimiento Predictivo</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
