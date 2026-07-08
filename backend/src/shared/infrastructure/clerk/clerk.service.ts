import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

type ClerkClient = any;

@Injectable()
export class ClerkService implements OnModuleInit {
  private client: ClerkClient;

  onModuleInit() {
    this.client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  getClient(): ClerkClient {
    return this.client;
  }

  verifyToken(token: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.verifyToken(token);
  }

  getUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.users.getUser(userId);
  }

  getOrganizationMemberships(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.users.getOrganizationMembershipList({ userId });
  }

  getOrganization(orgId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.organizations.getOrganization({ organizationId: orgId });
  }

  addMemberToOrganization(orgId: string, userId: string, role: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.organizations.createOrganizationMembership({
      organizationId: orgId,
      userId,
      role,
    });
  }

  getOrganizationMembers(orgId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return this.client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
  }
}
