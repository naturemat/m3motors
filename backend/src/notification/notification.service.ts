import { Injectable, Logger } from '@nestjs/common';
import { EnviarNotificacion } from './application/use-cases/EnviarNotificacion';
import { ReintentarNotificaciones } from './application/use-cases/ReintentarNotificaciones';
import { INotificationRepository } from './domain/ports/INotificationRepository';
import { NotificationProducer } from './infrastructure/queue/NotificationProducer';
import { EnviarNotificacionDTO } from './application/dto/EnviarNotificacionDTO';
import { NotificacionResponseDTO } from './application/dto/NotificacionResponseDTO';
import { CanalEnvio } from './domain/value-objects/CanalEnvio';
import { EstadoNotificacion } from './domain/value-objects/EstadoNotificacion';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly enviarNotificacion: EnviarNotificacion,
    private readonly reintentarNotificaciones: ReintentarNotificaciones,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationProducer: NotificationProducer,
  ) {}

  async enviar(dto: EnviarNotificacionDTO): Promise<NotificacionResponseDTO> {
    return this.enviarNotificacion.execute(dto);
  }

  async enviarAsync(dto: EnviarNotificacionDTO): Promise<void> {
    const notificacion = await this.enviarNotificacion.execute({
      ...dto,
      canal: dto.canal,
    });

    if (notificacion.estado === EstadoNotificacion.PENDIENTE) {
      if (dto.canal === CanalEnvio.EMAIL) {
        await this.notificationProducer.enqueueEmail({
          notificacionId: notificacion.id,
          clienteId: dto.clienteId,
          tipo: dto.tipo,
          asunto: dto.asunto,
          contenido: dto.contenido,
          metadata: dto.metadata,
        });
      }

      if (dto.canal === CanalEnvio.PUSH) {
        await this.notificationProducer.enqueuePush({
          notificacionId: notificacion.id,
          clienteId: dto.clienteId,
          tipo: dto.tipo,
          asunto: dto.asunto,
          contenido: dto.contenido,
          externalId: String(dto.clienteId),
          metadata: dto.metadata,
        });
      }
    }
  }

  async obtenerPorId(id: string): Promise<NotificacionResponseDTO | null> {
    const notificacion = await this.notificationRepository.findById(id);
    if (!notificacion) {
      return null;
    }

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

  async obtenerPorClienteId(
    clienteId: string,
  ): Promise<NotificacionResponseDTO[]> {
    const notificaciones =
      await this.notificationRepository.findByClienteId(clienteId);

    return notificaciones.map((n) => ({
      id: n.id!,
      clienteId: n.clienteId,
      vehicleId: n.vehicleId,
      tipo: n.tipo,
      canal: n.canal,
      asunto: n.asunto,
      contenido: n.contenido,
      estado: n.estado,
      entregado: n.entregado,
      falloMotivo: n.falloMotivo,
      intentos: n.intentos,
      maxIntentos: n.maxIntentos,
      enviadoEn: n.enviadoEn,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }

  async obtenerEstadisticas(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    return this.notificationProducer.getQueueStats();
  }

  async reintentarFallidas(): Promise<NotificacionResponseDTO[]> {
    return this.reintentarNotificaciones.execute();
  }
}
