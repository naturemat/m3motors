import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { MobileJwtService } from './jwt.service';

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  constructor(private readonly jwtService: MobileJwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];

    // Mobile token legacy format: mobile:::userId:::m3motors (backward compat)
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

    // JWT token (new mobile auth)
    try {
      const payload = this.jwtService.verifyToken(token);
      (request as any).auth = {
        userId: payload.sub,
        sessionId: 'jwt',
        role: payload.role,
        workshopId: payload.workshopId,
      };
      return true;
    } catch {
      // Not a valid JWT - might be a Clerk token, fall through
    }

    // Clerk token fallback - if ClerkService is available, try to verify
    // This is kept for backward compatibility with web admin routes
    try {
      // Dynamic import to avoid circular dependency issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ClerkService } = require('../clerk/clerk.service');
      // If we get here, we can't verify Clerk tokens in this guard
      // Clerk-guarded routes use ClerkAuthGuard directly
    } catch {
      // Ignore
    }

    throw new UnauthorizedException('Token inválido o expirado');
  }
}
