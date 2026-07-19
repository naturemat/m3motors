/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private readonly logger = new Logger(PrismaService.name);

  onModuleInit() {
    const { PrismaClient } = require('@prisma/client');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      this.logger.error(
        'DATABASE_URL no está configurado. La aplicación no podrá conectarse a la base de datos.',
      );
      throw new Error('DATABASE_URL no está configurado');
    }

    const url = new URL(databaseUrl);
    const adapter = new PrismaPg({
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: false },
    });

    const isDebug = process.env.LOG_LEVEL === 'debug';
    const logConfig = isDebug
      ? [{ level: 'query' as const, emit: 'event' as const }]
      : [];

    this.client = new PrismaClient({ adapter, log: logConfig });

    // Enable Prisma query logging in debug mode
    if (isDebug) {
      this.client.$on('query', (e: any) => {
        this.logger.debug(`[Prisma] ${e.query}`);
        this.logger.debug(`[Prisma] Params: ${e.params}`);
        this.logger.debug(`[Prisma] Duration: ${e.duration}ms`);
      });
      this.logger.log('Prisma query logging ACTIVADO (LOG_LEVEL=debug)');
    }

    this.logger.log('PrismaClient inicializado correctamente');
  }

  onModuleDestroy() {
    this.client?.$disconnect();
  }

  get client$(): any {
    return this.client;
  }
}
