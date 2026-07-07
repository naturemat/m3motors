import { EventDispatcher } from '../../../../src/registro-seguimiento/domain/events/EventDispatcher';

describe('EventDispatcher', () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    dispatcher = new EventDispatcher();
  });

  it('debe suscribir un handler a un evento', () => {
    const handler = jest.fn();
    dispatcher.subscribe('test.event', handler);

    expect(dispatcher.getHandlerCount('test.event')).toBe(1);
  });

  it('debe publicar un evento a todos los handlers suscritos', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    dispatcher.subscribe('test.event', handler1);
    dispatcher.subscribe('test.event', handler2);

    const payload = { placa: 'ABC-1234', valor: 100 };
    await dispatcher.publish('test.event', payload);

    expect(handler1).toHaveBeenCalledWith(payload);
    expect(handler2).toHaveBeenCalledWith(payload);
  });

  it('debe ejecutar handlers asincrónicos en orden', async () => {
    const order: number[] = [];
    const asyncHandler1 = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push(1);
    });
    const asyncHandler2 = jest.fn(() => {
      order.push(2);
    });

    dispatcher.subscribe('test.event', asyncHandler1);
    dispatcher.subscribe('test.event', asyncHandler2);

    await dispatcher.publish('test.event', {});

    expect(order).toEqual([1, 2]);
  });

  it('debe desuscribir un handler correctamente', async () => {
    const handler = jest.fn();
    dispatcher.subscribe('test.event', handler);
    dispatcher.unsubscribe('test.event', handler);

    await dispatcher.publish('test.event', {});

    expect(handler).not.toHaveBeenCalled();
    expect(dispatcher.getHandlerCount('test.event')).toBe(0);
  });

  it('no debe fallar al desuscribir un handler no existente', () => {
    const handler = jest.fn();
    expect(() =>
      dispatcher.unsubscribe('nonexistent.event', handler),
    ).not.toThrow();
  });

  it('no debe fallar al publicar un evento sin handlers', async () => {
    await expect(
      dispatcher.publish('nonexistent.event', {}),
    ).resolves.not.toThrow();
  });

  it('debe manejar handlers independientes por nombre de evento', async () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    dispatcher.subscribe('event.a', handlerA);
    dispatcher.subscribe('event.b', handlerB);

    await dispatcher.publish('event.a', { tipo: 'A' });

    expect(handlerA).toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });

  it('debe permitir multiples suscripciones de diferentes handlers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();

    dispatcher.subscribe('test.event', handler1);
    dispatcher.subscribe('test.event', handler2);
    dispatcher.subscribe('test.event', handler3);

    expect(dispatcher.getHandlerCount('test.event')).toBe(3);
  });
});
