import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Headers,
  Body,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Webhook } from 'svix';
import { ClerkService } from '../clerk.service';
import { ClerkAuthGuard } from '../clerk.guard';
import { WebhookHandlerService } from '../services/webhook-handler.service';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

type WebhookData = any;

@Controller('auth')
export class AuthController {
  private webhook: Webhook | null = null;

  constructor(
    private readonly clerkService: ClerkService,
    private readonly webhookHandler: WebhookHandlerService,
  ) {}

  private getWebhook(): Webhook {
    if (!this.webhook) {
      const secret = process.env.CLERK_WEBHOOK_SECRET;
      if (!secret) throw new Error('CLERK_WEBHOOK_SECRET no está configurado');
      this.webhook = new Webhook(secret);
    }
    return this.webhook;
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const { userId } = req.auth!;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.clerkService.getUser(userId);

    // Obtener membresías de forma segura
    const orgs: { id: string; name: string; role: string }[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const memberships =
        await this.clerkService.getOrganizationMemberships(userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const memberList = memberships?.data ?? [];

      for (const membership of memberList) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const orgId = membership?.organization;
        if (!orgId) continue;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const org = await this.clerkService.getOrganization(orgId);
        orgs.push({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          id: org?.id ?? '',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          name: org?.name ?? '',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          role: membership?.role ?? '',
        });
      }
    } catch {
      // Si falla la obtención de membresías, retornamos sin orgs
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: user?.id ?? '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      email: user?.emailAddresses?.[0]?.emailAddress ?? '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      firstName: user?.firstName ?? '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      lastName: user?.lastName ?? '',
      organizations: orgs,
    };
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() body: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const eventType = body.type;

    // Verificar firma solo en producción
    if (process.env.NODE_ENV === 'production') {
      const payload = JSON.stringify(body);
      const headers = {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      };

      try {
        this.getWebhook().verify(payload, headers);
      } catch {
        throw new UnauthorizedException(
          'Webhook signature verification failed',
        );
      }
    }

    switch (eventType) {
      case 'user.created':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handleUserCreated(body.data);
        break;
      case 'user.updated':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handleUserUpdated(body.data);
        break;
      case 'user.deleted':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handleUserDeleted(body.data);
        break;
      case 'organizationMembership.created':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handleOrgMemberCreated(body.data);
        break;
      case 'organizationMembership.deleted':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.handleOrgMemberDeleted(body.data);
        break;
    }

    return { received: true };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleUserCreated(data: WebhookData) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('[Webhook] User created:', data.id as string);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleUserUpdated(data: WebhookData) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('[Webhook] User updated:', data.id as string);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleUserDeleted(data: WebhookData) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('[Webhook] User deleted:', data.id as string);
  }

  private async handleOrgMemberCreated(data: WebhookData) {
    await this.webhookHandler.handleOrgMemberCreated(data);
  }

  private handleOrgMemberDeleted(data: WebhookData) {
    this.webhookHandler.handleOrgMemberDeleted(data);
  }
}
