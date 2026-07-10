import { Injectable, Logger } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { IEmailService } from '../../domain/ports/IEmailService';
import { IPushService } from '../../domain/ports/IPushService';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { NotificacionResponseDTO } from '../dto/NotificacionResponseDTO';

@Injectable()
export class ReintentarNotificaciones {
  private readonly logger = new Logger(ReintentarNotificaciones.name);

  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly emailService: IEmailService,
    private readonly pushService: IPushService,
  ) {}

  async execute(): Promise<NotificacionResponseDTO[]> {
    const notificaciones =
      await this.notificationRepository.findFallidasParaReintentar();

    const results: NotificacionResponseDTO[] = [];

    for (const notificacion of notificaciones) {
      try {
        if (notificacion.canal === CanalEnvio.EMAIL) {
          const emailDestino = notificacion.emailDestino;
          if (!emailDestino) {
            this.logger.warn(
              `Notificacion ${notificacion.id} sin emailDestino, omitiendo reintento de email`,
            );
            continue;
          }
          const emailResult = await this.emailService.sendEmail({
            to: emailDestino,
            subject: notificacion.asunto,
            html: notificacion.contenido,
          });

          if (!emailResult.success) {
            throw new Error(emailResult.error);
          }
        }

        if (notificacion.canal === CanalEnvio.PUSH) {
          const pushResult = await this.pushService.sendPush({
            externalId: notificacion.clienteId,
            heading: notificacion.asunto,
            content: notificacion.contenido,
          });

          if (!pushResult.success) {
            throw new Error(pushResult.error);
          }
        }

        notificacion.marcarComoEnviada();
        await this.notificationRepository.update(notificacion);

        results.push(this.toResponseDTO(notificacion));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        notificacion.marcarComoFallida(errorMessage);
        await this.notificationRepository.update(notificacion);

        this.logger.error(
          `Error reintentando notificacion ${notificacion.id}: ${errorMessage}`,
        );
      }
    }

    return results;
  }

  private toResponseDTO(
    notificacion: import('../../domain/entities/Notificacion').Notificacion,
  ): NotificacionResponseDTO {
    return {
      id: notificacion.id!,
      clienteId: notificacion.clienteId,
      vehicleId: notificacion.vehicleId,
      tipo: notificacion.tipo,
      canal: notificacion.canal,
      asunto: notificacion.asunto,
      contenido: notificacion.contenido,
      estado: notificacion.estado,
      entregado: notificacion.entregado,
      falloMotivo: notificacion.falloMotivo,
      intentos: notificacion.intentos,
      maxIntentos: notificacion.maxIntentos,
      enviadoEn: notificacion.enviadoEn,
      createdAt: notificacion.createdAt,
      updatedAt: notificacion.updatedAt,
    };
  }
}
