import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

type ClerkClient = any;

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private client: ClerkClient | null = null;

  private getClient(): ClerkClient {
    if (!this.client) {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY no está configurado');
      }
      this.client = createClerkClient({ secretKey });
      this.logger.log('ClerkClient initialized');
    }
    return this.client;
  }

  async verifyToken(token: string) {
    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    const issuer = 'https://open-crow-10.clerk.accounts.dev';
    const jwksUrl = new URL(`${issuer}/.well-known/jwks.json`);
    const jwks = createRemoteJWKSet(jwksUrl);

    try {
      const { payload } = await jwtVerify(token, jwks, { issuer });
      return payload;
    } catch {
      throw new Error('Token verification failed');
    }
  }

  getUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.getClient().users.getUser(userId);
  }

  getOrganizationMemberships(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.getClient().users.getOrganizationMembershipList({ userId });
  }

  getOrganization(orgId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.getClient().organizations.getOrganization({
      organizationId: orgId,
    });
  }

  addMemberToOrganization(orgId: string, userId: string, role: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.getClient().organizations.createOrganizationMembership({
      organizationId: orgId,
      userId,
      role,
    });
  }

  getOrganizationMembers(orgId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.getClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
  }
}
