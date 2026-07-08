/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  onModuleInit() {
    const adapter = new PrismaPg({
      host: 'aws-1-us-east-2.pooler.supabase.com',
      port: 5432,
      user: 'postgres.tdpxtdgwzwlhgpujnlzc',
      password: 'Arqui.Pass1@',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    });
    this.client = new PrismaClient({ adapter });
  }

  onModuleDestroy() {
    this.client?.$disconnect();
  }

  get client$(): any {
    return this.client;
  }
}
