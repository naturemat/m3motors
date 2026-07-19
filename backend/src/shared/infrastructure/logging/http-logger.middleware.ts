import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.LOG_LEVEL !== 'debug') {
      return next();
    }

    const start = Date.now();
    const { method, originalUrl } = req;

    // Log request body (sanitize passwords)
    const body = req.body ? { ...req.body } : {};
    if (body.password) body.password = '***';
    if (body.passwordHash) body.passwordHash = '***';

    // Log auth header (first 30 chars only)
    const authHeader = req.headers.authorization;
    const authPreview = authHeader ? authHeader.substring(0, 30) + '...' : 'none';

    this.logger.log(`→ ${method} ${originalUrl}`);
    this.logger.log(`  Body: ${JSON.stringify(body)}`);
    this.logger.log(`  Auth: ${authPreview}`);

    // Hook into response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const emoji = status >= 400 ? '❌' : '✅';
      this.logger.log(`${emoji} ${method} ${originalUrl} → ${status} (${duration}ms)`);
    });

    next();
  }
}
