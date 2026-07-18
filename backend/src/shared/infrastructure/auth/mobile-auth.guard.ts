/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MobileAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
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

    return false;
  }
}
