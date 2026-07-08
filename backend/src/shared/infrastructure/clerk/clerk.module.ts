import { Module, Global } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './clerk.guard';
import { WebhookHandlerService } from './services/webhook-handler.service';

@Global()
@Module({
  providers: [ClerkService, ClerkAuthGuard, WebhookHandlerService],
  exports: [ClerkService, ClerkAuthGuard, WebhookHandlerService],
})
export class ClerkModule {}
