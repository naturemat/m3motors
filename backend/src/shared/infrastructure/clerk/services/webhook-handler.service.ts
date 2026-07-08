import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);
  private prisma!: PrismaClient;

  constructor() {
    try {
      const adapter = new PrismaPg({
        host: 'aws-1-us-east-2.pooler.supabase.com',
        port: 5432,
        user: 'postgres.tdpxtdgwzwlhgpujnlzc',
        password: 'Arqui.Pass1@',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
      });
      this.prisma = new PrismaClient({ adapter });
      this.logger.log('PrismaClient initialized for webhook handler');
    } catch (error) {
      this.logger.error('Failed to initialize PrismaClient', error);
    }
  }

  handleUserCreated(data: { id: string }) {
    this.logger.log('Processing user.created:', data.id);
  }

  handleUserUpdated(data: { id: string }) {
    this.logger.log('Processing user.updated:', data.id);
  }

  handleUserDeleted(data: { id: string }) {
    this.logger.log('Processing user.deleted:', data.id);
  }

  async handleOrgMemberCreated(data: any) {
    this.logger.log('Processing organizationMembership.created');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = data?.public_user_data?.user_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const orgId = data?.organization?.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const role = data?.role;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const email = data?.public_user_data?.identifier ?? '';

    if (!userId || !orgId || !role) {
      this.logger.warn('Invalid webhook data structure');
      return;
    }

    switch (role) {
      case 'org:admin':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.syncAdmin(userId, orgId, email);
        break;
      case 'org:member':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.syncMechanic(userId, orgId, email);
        break;
      case 'org:client':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.syncCliente(userId, orgId, email);
        break;
      default:
        this.logger.warn('Unknown role:', role);
    }
  }

  handleOrgMemberDeleted(_data: any) {
    this.logger.log('Processing organizationMembership.deleted');
  }

  private async syncAdmin(clerkId: string, orgId: string, email: string) {
    try {
      // Buscar taller existente por ownerId o por clerk_org_id
      let workshop = await this.prisma.workshop.findFirst({
        where: { clerkOrgId: orgId },
      });

      if (!workshop) {
        workshop = await this.prisma.workshop.findFirst({
          where: { ownerId: clerkId },
        });
      }

      if (workshop) {
        // Actualizar clerk_org_id si no lo tiene
        if (!workshop.clerkOrgId) {
          await this.prisma.workshop.update({
            where: { id: workshop.id },
            data: { clerkOrgId: orgId },
          });
          this.logger.log('Workshop clerk_org_id updated:', orgId);
        }
      } else {
        // Crear nuevo taller
        workshop = await this.prisma.workshop.create({
          data: {
            nombre: `Taller de ${email.split('@')[0]}`,
            ownerId: clerkId,
            clerkOrgId: orgId,
            direccion: '',
            telefono: '',
            email,
          },
        });
        this.logger.log('Workshop created for admin:', clerkId);
      }
    } catch (error) {
      this.logger.error('Error syncing admin:', error);
    }
  }

  private async syncMechanic(clerkId: string, orgId: string, email: string) {
    try {
      const workshop = await this.findWorkshopForOrg(orgId);
      if (!workshop) {
        this.logger.warn('No workshop found for org:', orgId);
        return;
      }

      const existing = await this.prisma.mechanic.findFirst({
        where: { clerkId },
      });

      if (!existing) {
        await this.prisma.mechanic.create({
          data: {
            workshopId: workshop.id,
            clerkId,
            nombre: email.split('@')[0],
            especialidad: null,
            activo: true,
            creadoPor: workshop.id,
          },
        });
        this.logger.log('Mechanic created:', clerkId);
      }
    } catch (error) {
      this.logger.error('Error syncing mechanic:', error);
    }
  }

  private async syncCliente(clerkId: string, orgId: string, email: string) {
    try {
      const workshop = await this.findWorkshopForOrg(orgId);
      if (!workshop) {
        this.logger.warn('No workshop found for org:', orgId);
        return;
      }

      const existing = await this.prisma.cliente.findFirst({
        where: { clerkId },
      });

      if (!existing) {
        const mechanic = await this.prisma.mechanic.findFirst({
          where: { workshopId: workshop.id, activo: true },
        });

        if (!mechanic) {
          this.logger.warn('No active mechanic found for org:', orgId);
          return;
        }

        await this.prisma.cliente.create({
          data: {
            clerkId,
            nombre: email.split('@')[0],
            telefono: '',
            email,
            status: 'ACTIVATED',
            idMecanicoActivo: mechanic.id,
          },
        });
        this.logger.log('Cliente created:', clerkId);
      }
    } catch (error) {
      this.logger.error('Error syncing cliente:', error);
    }
  }

  private async findWorkshopForOrg(orgId: string) {
    try {
      // Buscar por clerk_org_id primero
      const workshop = await this.prisma.workshop.findFirst({
        where: { clerkOrgId: orgId },
      });

      if (workshop) return workshop;

      // Fallback: buscar el primer taller (para desarrollo)
      return await this.prisma.workshop.findFirst();
    } catch (error) {
      this.logger.error('Error finding workshop:', error);
      return null;
    }
  }
}
