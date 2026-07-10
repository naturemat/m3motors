import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { NotificationJobData } from './NotificationWorker';

@Injectable()
export class NotificationProducer {
  private readonly logger = new Logger(NotificationProducer.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async enqueueEmail(
    jobData: Omit<NotificationJobData, 'canal'>,
  ): Promise<void> {
    const data: NotificationJobData = {
      ...jobData,
      canal: CanalEnvio.EMAIL,
    };

    await this.notificationQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(
      `Job de email encolado para notificacion ${jobData.notificacionId}`,
    );
  }

  async enqueuePush(
    jobData: Omit<NotificationJobData, 'canal'>,
  ): Promise<void> {
    const data: NotificationJobData = {
      ...jobData,
      canal: CanalEnvio.PUSH,
    };

    await this.notificationQueue.add('send-push', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(
      `Job de push encolado para notificacion ${jobData.notificacionId}`,
    );
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
