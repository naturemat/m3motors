export interface DomainEventBase {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
}

export type EventHandler<T extends DomainEventBase = DomainEventBase> = (
  payload: T,
) => void | Promise<void>;
