import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEventPublisher } from '../../domain/ports/events/IDomainEventPublisher';

@Injectable()
export class NestEventPublisher implements IDomainEventPublisher {
  private readonly logger = new Logger(NestEventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(eventName: string, payload: unknown): Promise<void> {
    this.logger.debug(`Publicando evento: ${eventName}`);
    await this.eventEmitter.emitAsync(eventName, payload);
  }
}
