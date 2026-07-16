/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
    const issuer = process.env.CLERK_ISSUER_URL;
    if (!issuer) {
      throw new Error('CLERK_ISSUER_URL no está configurado');
    }
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
    return this.getClient().users.getUser(userId);
  }

  getOrganizationMemberships(userId: string) {
    return this.getClient().users.getOrganizationMembershipList({ userId });
  }

  getOrganization(orgId: string) {
    return this.getClient().organizations.getOrganization({
      organizationId: orgId,
    });
  }

  addMemberToOrganization(orgId: string, userId: string, role: string) {
    return this.getClient().organizations.createOrganizationMembership({
      organizationId: orgId,
      userId,
      role,
    });
  }

  getOrganizationMembers(orgId: string) {
    return this.getClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
  }

  createUser(params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    publicMetadata?: Record<string, unknown>;
  }) {
    return this.getClient().users.createUser({
      emailAddress: [params.email],
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
      publicMetadata: params.publicMetadata ?? {},
    });
  }

  async getUserByEmail(email: string) {
    try {
      const users = await this.getClient().users.getUserList({
        emailAddress: [email],
      });
      return users.data?.[0] ?? null;
    } catch {
      return null;
    }
  }

  updateUserMetadata(userId: string, publicMetadata: Record<string, unknown>) {
    return this.getClient().users.updateUser(userId, {
      publicMetadata,
    });
  }
}
