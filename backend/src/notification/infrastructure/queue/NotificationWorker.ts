import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { IEmailService } from '../../domain/ports/IEmailService';
import { IPushService } from '../../domain/ports/IPushService';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';

export interface NotificationJobData {
  notificacionId: string;
  clienteId: string;
  vehicleId?: string;
  tipo: string;
  canal: CanalEnvio;
  asunto: string;
  contenido: string;
  email?: string;
  externalId?: string;
  metadata?: Record<string, unknown>;
}

@Processor('notifications')
export class NotificationWorker {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly emailService: IEmailService,
    private readonly pushService: IPushService,
  ) {}

  @Process('send-email')
  async handleEmailJob(job: Job<NotificationJobData>): Promise<void> {
    const { notificacionId, asunto, contenido, email } = job.data;

    this.logger.log(
      `Procesando job de email ${job.id} para notificacion ${notificacionId}`,
    );

    if (!email) {
      throw new Error('Email del cliente no proporcionado');
    }

    const result = await this.emailService.sendEmail({
      to: email,
      subject: asunto,
      html: contenido,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    this.logger.log(
      `Email enviado exitosamente para notificacion ${notificacionId}`,
    );
  }

  @Process('send-push')
  async handlePushJob(job: Job<NotificationJobData>): Promise<void> {
    const { notificacionId, asunto, contenido, externalId, metadata } =
      job.data;

    this.logger.log(
      `Procesando job de push ${job.id} para notificacion ${notificacionId}`,
    );

    if (!externalId) {
      throw new Error('External ID del cliente no proporcionado');
    }

    const result = await this.pushService.sendPush({
      externalId,
      heading: asunto,
      content: contenido,
      data: metadata,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    this.logger.log(
      `Push notification enviada para notificacion ${notificacionId}`,
    );
  }
}
