export interface IDomainEventPublisher {
  publish(eventName: string, payload: Record<string, unknown>): Promise<void>;
}
