import { WorkshopRegistradoEvent } from '../../../../src/registro-seguimiento/domain/events/WorkshopRegistradoEvent';

describe('WorkshopRegistradoEvent', () => {
  const params = {
    workshopId: 'wk-001',
    nombre: 'Taller Mecánico Express',
    ownerId: 'owner-001',
    direccion: 'Av. Principal 123, Quito',
    telefono: '+593 99 123 4567',
    email: 'taller@example.com',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new WorkshopRegistradoEvent(params);

    expect(evento.workshopId).toBe(params.workshopId);
    expect(evento.nombre).toBe(params.nombre);
    expect(evento.ownerId).toBe(params.ownerId);
    expect(evento.direccion).toBe(params.direccion);
    expect(evento.telefono).toBe(params.telefono);
    expect(evento.email).toBe(params.email);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(WorkshopRegistradoEvent.EVENT_NAME).toBe('workshop.registrado');
  });

  it('debe ser inmutable', () => {
    const evento = new WorkshopRegistradoEvent(params);

    expect(() => {
      (evento as unknown as { workshopId: string }).workshopId = 'wk-999';
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new WorkshopRegistradoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.occurredOn).toBe(evento.occurredOn);
    expect(payload.eventName).toBe('workshop.registrado');
    expect(payload.workshopId).toBe(params.workshopId);
    expect(payload.nombre).toBe(params.nombre);
    expect(payload.ownerId).toBe(params.ownerId);
    expect(payload.direccion).toBe(params.direccion);
    expect(payload.telefono).toBe(params.telefono);
    expect(payload.email).toBe(params.email);
  });
});
