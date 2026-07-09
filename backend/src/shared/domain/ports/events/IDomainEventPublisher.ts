export const IDOMAIN_EVENT_PUBLISHER = 'IDomainEventPublisher';

export interface IDomainEventPublisher {
  publish(eventName: string, payload: unknown): Promise<void>;
}
