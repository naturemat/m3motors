import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    const userId = data?.public_user_data?.user_id;
    const orgId = data?.organization?.id;
    const role = data?.role;
    const email = data?.public_user_data?.identifier ?? '';
    const memberRole =
      (data?.public_metadata?.role as string | undefined) ?? 'mechanic';

    if (!userId || !orgId || !role) {
      this.logger.warn('Invalid webhook data structure');
      return;
    }

    switch (role) {
      case 'org:admin':
        await this.syncAdmin(userId, orgId, email);
        break;
      case 'org:member':
        if (memberRole === 'client') {
          await this.syncCliente(userId, orgId, email);
        } else {
          await this.syncMechanic(userId, orgId, email);
        }
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
      const existing = await this.prisma.client$.workshop.findFirst({
        where: { clerkOrgId: orgId },
      });

      if (!existing) {
        const byOwner = await this.prisma.client$.workshop.findFirst({
          where: { ownerId: clerkId },
        });

        if (byOwner) {
          await this.prisma.client$.workshop.update({
            where: { id: byOwner.id },
            data: { clerkOrgId: orgId },
          });
          this.logger.log('Workshop clerk_org_id updated:', orgId);
        } else {
          await this.prisma.client$.workshop.create({
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

      const existing = await this.prisma.client$.mechanic.findFirst({
        where: { clerkId },
      });

      if (!existing) {
        await this.prisma.client$.mechanic.create({
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

      const existing = await this.prisma.client$.cliente.findFirst({
        where: { clerkId },
      });

      if (!existing) {
        const mechanic = await this.prisma.client$.mechanic.findFirst({
          where: { workshopId: workshop.id, activo: true },
        });

        if (!mechanic) {
          this.logger.warn('No active mechanic found for org:', orgId);
          return;
        }

        await this.prisma.client$.cliente.create({
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
      const workshop = await this.prisma.client$.workshop.findFirst({
        where: { clerkOrgId: orgId },
      });

      if (workshop) return workshop;

      return await this.prisma.client$.workshop.findFirst();
    } catch (error) {
      this.logger.error('Error finding workshop:', error);
      return null;
    }
  }
}
