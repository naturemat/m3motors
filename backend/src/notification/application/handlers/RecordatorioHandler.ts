import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnviarNotificacion } from '../use-cases/EnviarNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';

interface ClientePreRegistro {
  id: string;
  nombre: string;
  email: string;
  fechaPreRegistro: Date;
}

@Injectable()
export class RecordatorioHandler {
  private readonly logger = new Logger(RecordatorioHandler.name);

  constructor(private readonly enviarNotificacion: EnviarNotificacion) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async verificarClientesInactivos(): Promise<void> {
    this.logger.log('Verificando clientes inactivos para recordatorio');

    const clientesInactivos = this.obtenerClientesInactivos();

    for (const cliente of clientesInactivos) {
      const diasInactivo = Math.floor(
        (Date.now() - new Date(cliente.fechaPreRegistro).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diasInactivo >= 30) {
        await this.enviarRecordatorio(cliente, diasInactivo);
      }
    }
  }

  private obtenerClientesInactivos(): ClientePreRegistro[] {
    return [];
  }

  private async enviarRecordatorio(
    cliente: ClientePreRegistro,
    diasInactivo: number,
  ): Promise<void> {
    this.logger.log(
      `Enviando recordatorio a cliente ${cliente.id} (${diasInactivo} dias inactivo)`,
    );

    const asunto = 'Recordatorio: Activacion de su cuenta pendiente';
    const contenido = this.construirContenidoRecordatorio(
      cliente.nombre,
      diasInactivo,
    );

    await this.enviarNotificacion.execute({
      clienteId: cliente.id,
      tipo: TipoNotificacion.RECORDATORIO,
      canal: CanalEnvio.EMAIL,
      asunto,
      contenido,
      email: cliente.email,
      metadata: {
        diasInactivo,
        fechaPreRegistro: cliente.fechaPreRegistro,
      },
    });
  }

  private construirContenidoRecordatorio(
    nombre: string,
    diasInactivo: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recordatorio de Activacion</h1>
          </div>
          <div class="content">
            <p>Hola ${nombre},</p>
            <p>Han pasado ${diasInactivo} dias desde que se pre-registro en M3Motors.</p>
            <p>Para comenzar a recibir alertas de mantenimiento predictivo, por favor active su cuenta.</p>
            <p>Si tiene alguna duda, no dude en contactarnos.</p>
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
