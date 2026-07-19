import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { MobileJwtService } from './jwt.service';

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  private readonly logger = new Logger(UnifiedAuthGuard.name);

  constructor(private readonly jwtService: MobileJwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      this.logger.warn('Auth failed: No Bearer token');
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];

    // Mobile token legacy format: mobile:::userId:::m3motors (backward compat)
    if (token.startsWith('mobile:::')) {
      const parts = token.split(':::');
      if (parts.length >= 2) {
        this.logger.log(`[Auth] Legacy mobile token → userId=${parts[1]}`);
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
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.log(`[Auth] JWT verified → sub=${payload.sub}, role=${payload.role}, workshopId=${payload.workshopId}`);
      }
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

    this.logger.warn('Auth failed: Invalid token');
    throw new UnauthorizedException('Token inválido o expirado');
  }
}
