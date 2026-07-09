import { NotificacionEnviadaEvent } from '../../../../src/notification/domain/events/NotificacionEnviadaEvent';

describe('NotificacionEnviadaEvent', () => {
  const params = {
    clienteId: 'cli-001',
    vehicleId: 'veh-001',
    tipoNotificacion: 'ALERTA_MANTENIMIENTO' as const,
    canal: 'EMAIL' as const,
    mensaje: 'Su filtro de aceite requiere cambio.',
    entregado: true,
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new NotificacionEnviadaEvent(params);

    expect(evento.clienteId).toBe(params.clienteId);
    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.tipoNotificacion).toBe('ALERTA_MANTENIMIENTO');
    expect(evento.canal).toBe('EMAIL');
    expect(evento.mensaje).toBe(params.mensaje);
    expect(evento.entregado).toBe(true);
    expect(evento.fechaEnvio).toBeInstanceOf(Date);
    expect(evento.falloMotivo).toBeNull();
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(NotificacionEnviadaEvent.EVENT_NAME).toBe('notificacion.enviada');
  });

  it('debe ser inmutable', () => {
    const evento = new NotificacionEnviadaEvent(params);

    expect(() => {
      (evento as unknown as { entregado: boolean }).entregado = false;
    }).toThrow();
  });

  it('debe manejar falloMotivo cuando entregado es false', () => {
    const paramsFallo = {
      ...params,
      entregado: false,
      falloMotivo: 'Servicio de email no disponible',
    };
    const evento = new NotificacionEnviadaEvent(paramsFallo);

    expect(evento.entregado).toBe(false);
    expect(evento.falloMotivo).toBe('Servicio de email no disponible');
  });

  it('debe manejar vehicleId opcional como null', () => {
    const paramsSinVehicle = { ...params, vehicleId: undefined };
    const evento = new NotificacionEnviadaEvent(paramsSinVehicle);

    expect(evento.vehicleId).toBeNull();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new NotificacionEnviadaEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('notificacion.enviada');
    expect(payload.clienteId).toBe(params.clienteId);
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.tipoNotificacion).toBe('ALERTA_MANTENIMIENTO');
    expect(payload.canal).toBe('EMAIL');
    expect(payload.mensaje).toBe(params.mensaje);
    expect(payload.entregado).toBe(true);
  });
});
