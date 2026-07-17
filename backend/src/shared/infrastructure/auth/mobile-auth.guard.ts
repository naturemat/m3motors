import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MobileAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    // Mobile tokens start with 'mobile_'
    if (token.startsWith('mobile_')) {
      // Extract userId from token format: mobile_userId_m3motors
      const parts = token.split('_');
      if (parts.length >= 2) {
        (request as any).auth = {
          userId: parts[1],
          sessionId: 'mobile',
        };
        return true;
      }
    }

    return false;
  }
}
