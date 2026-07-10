import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { EnviarNotificacion } from './application/use-cases/EnviarNotificacion';
import { ReintentarNotificaciones } from './application/use-cases/ReintentarNotificaciones';

import { AlertaGeneradaHandler } from './application/handlers/AlertaGeneradaHandler';
import { ClienteActivadoHandler } from './application/handlers/ClienteActivadoHandler';
import { RecordatorioHandler } from './application/handlers/RecordatorioHandler';

import { INotificationRepository } from './domain/ports/INotificationRepository';
import { IEmailService } from './domain/ports/IEmailService';
import { IPushService } from './domain/ports/IPushService';

import { ResendEmailService } from './infrastructure/email/ResendEmailService';
import { OneSignalPushService } from './infrastructure/push/OneSignalPushService';
import { PrismaNotificacionRepository } from './infrastructure/persistence/PrismaNotificacionRepository';
import { NotificationWorker } from './infrastructure/queue/NotificationWorker';
import { NotificationProducer } from './infrastructure/queue/NotificationProducer';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from '../shared/infrastructure/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [
    PrismaService,
    {
      provide: INotificationRepository,
      useClass: PrismaNotificacionRepository,
    },
    {
      provide: IEmailService,
      useClass: ResendEmailService,
    },
    {
      provide: IPushService,
      useClass: OneSignalPushService,
    },
    EnviarNotificacion,
    ReintentarNotificaciones,
    AlertaGeneradaHandler,
    ClienteActivadoHandler,
    RecordatorioHandler,
    NotificationWorker,
    NotificationProducer,
    NotificationService,
  ],
  exports: [
    EnviarNotificacion,
    INotificationRepository,
    IEmailService,
    IPushService,
    NotificationProducer,
    NotificationService,
  ],
})
export class NotificationModule {}
