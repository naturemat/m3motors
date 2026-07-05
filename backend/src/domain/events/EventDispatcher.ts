export type EventHandler = (payload: Record<string, unknown>) => void | Promise<void>;

export class EventDispatcher {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) || [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName);
    if (!existing) return;
    const filtered = existing.filter((h) => h !== handler);
    this.handlers.set(eventName, filtered);
  }

  async publish(
    eventName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const existing = this.handlers.get(eventName);
    if (!existing || existing.length === 0) return;
    for (const handler of existing) {
      await handler(payload);
    }
  }

  getHandlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.length || 0;
  }
}
