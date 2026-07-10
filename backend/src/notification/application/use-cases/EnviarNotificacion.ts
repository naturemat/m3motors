import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notificacion } from '../../domain/entities/Notificacion';
import { EstadoNotificacion } from '../../domain/value-objects/EstadoNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { IEmailService } from '../../domain/ports/IEmailService';
import { IPushService } from '../../domain/ports/IPushService';
import { EnviarNotificacionDTO } from '../dto/EnviarNotificacionDTO';
import { NotificacionResponseDTO } from '../dto/NotificacionResponseDTO';

@Injectable()
export class EnviarNotificacion {
  private readonly logger = new Logger(EnviarNotificacion.name);

  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly emailService: IEmailService,
    private readonly pushService: IPushService,
  ) {}

  async execute(dto: EnviarNotificacionDTO): Promise<NotificacionResponseDTO> {
    const notificacion = new Notificacion({
      id: uuidv4(),
      clienteId: dto.clienteId,
      vehicleId: dto.vehicleId,
      tipo: dto.tipo,
      canal: dto.canal,
      asunto: dto.asunto,
      contenido: dto.contenido,
      emailDestino: dto.email,
      estado: EstadoNotificacion.PENDIENTE,
      metadata: dto.metadata,
    });

    const saved = await this.notificationRepository.save(notificacion);

    try {
      if (dto.canal === CanalEnvio.EMAIL) {
        await this.enviarEmail(saved, dto);
      }

      if (dto.canal === CanalEnvio.PUSH) {
        await this.enviarPush(saved, dto);
      }

      saved.marcarComoEnviada();
      await this.notificationRepository.update(saved);

      this.logger.log(`Notificacion ${saved.id} enviada exitosamente`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      saved.marcarComoFallida(errorMessage);
      await this.notificationRepository.update(saved);

      this.logger.error(
        `Error enviando notificacion ${saved.id}: ${errorMessage}`,
      );
    }

    return this.toResponseDTO(saved);
  }

  private async enviarEmail(
    notificacion: Notificacion,
    dto: EnviarNotificacionDTO,
  ): Promise<void> {
    const result = await this.emailService.sendEmail({
      to: dto.email,
      subject: dto.asunto,
      html: dto.contenido,
    });

    if (!result.success) {
      throw new Error(result.error || 'Error enviando email');
    }
  }

  private async enviarPush(
    notificacion: Notificacion,
    dto: EnviarNotificacionDTO,
  ): Promise<void> {
    const result = await this.pushService.sendPush({
      externalId: dto.clienteId,
      heading: dto.asunto,
      content: dto.contenido,
      data: dto.metadata,
    });

    if (!result.success) {
      throw new Error(result.error || 'Error enviando push');
    }
  }

  private toResponseDTO(notificacion: Notificacion): NotificacionResponseDTO {
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
