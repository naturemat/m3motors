import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkService } from './clerk.service';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.split(' ')[1];

    try {
      console.log('[ClerkGuard] Verifying token...');
      console.log(
        '[ClerkGuard] CLERK_SECRET_KEY:',
        process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET',
      );

      const payload = await this.clerkService.verifyToken(token);
      console.log('[ClerkGuard] Token verified, payload.sub:', payload.sub);
      request.auth = {
        userId: payload.sub as string,

        sessionId: payload.sid as string,
      };
      return true;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('[ClerkGuard] Token verification failed:', error.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
