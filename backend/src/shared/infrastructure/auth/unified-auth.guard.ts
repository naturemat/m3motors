/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ClerkService } from '../clerk/clerk.service';

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  constructor(private readonly clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];

    // Mobile token format: mobile:::userId:::m3motors
    if (token.startsWith('mobile:::')) {
      const parts = token.split(':::');
      if (parts.length >= 2) {
        (request as any).auth = {
          userId: parts[1],
          sessionId: 'mobile',
        };
        return true;
      }
    }

    // Clerk token - verify it
    try {
      const payload = await this.clerkService.verifyToken(token);
      (request as any).auth = {
        userId: payload.sub as string,
        sessionId: payload.sid as string,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
