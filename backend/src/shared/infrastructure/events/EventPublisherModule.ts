import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NestEventPublisher } from './NestEventPublisher';
import { IDOMAIN_EVENT_PUBLISHER } from '../../domain/ports/events/IDomainEventPublisher';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: IDOMAIN_EVENT_PUBLISHER,
      useClass: NestEventPublisher,
    },
  ],
  exports: [IDOMAIN_EVENT_PUBLISHER],
})
export class EventPublisherModule {}
