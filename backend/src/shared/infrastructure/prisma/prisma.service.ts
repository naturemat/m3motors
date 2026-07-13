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
    this.client = new PrismaClient({ adapter });
    this.logger.log('PrismaClient inicializado correctamente');
  }

  onModuleDestroy() {
    this.client?.$disconnect();
  }

  get client$(): any {
    return this.client;
  }
}
