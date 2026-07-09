import { ClientePreRegistradoEvent } from '../../../../src/registro-seguimiento/domain/events/ClientePreRegistradoEvent';

describe('ClientePreRegistradoEvent', () => {
  const params = {
    preRegisteredCustomerId: 'pre-001',
    workshopId: 'wk-001',
    nombre: 'Carlos López',
    telefono: '+593 98 765 4321',
    email: 'carlos@email.com',
    licensePlate: 'PBA-1234',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new ClientePreRegistradoEvent(params);

    expect(evento.preRegisteredCustomerId).toBe(params.preRegisteredCustomerId);
    expect(evento.workshopId).toBe(params.workshopId);
    expect(evento.nombre).toBe(params.nombre);
    expect(evento.telefono).toBe(params.telefono);
    expect(evento.email).toBe(params.email);
    expect(evento.licensePlate).toBe(params.licensePlate);
    expect(evento.status).toBe('PENDING');
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(ClientePreRegistradoEvent.EVENT_NAME).toBe('cliente.pre-registrado');
  });

  it('debe ser inmutable', () => {
    const evento = new ClientePreRegistradoEvent(params);

    expect(() => {
      (evento as unknown as { status: string }).status = 'ACTIVATED';
    }).toThrow();
  });

  it('debe manejar licensePlate opcional como null', () => {
    const paramsSinPlaca = { ...params, licensePlate: undefined };
    const evento = new ClientePreRegistradoEvent(paramsSinPlaca);

    expect(evento.licensePlate).toBeNull();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new ClientePreRegistradoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('cliente.pre-registrado');
    expect(payload.preRegisteredCustomerId).toBe(
      params.preRegisteredCustomerId,
    );
    expect(payload.workshopId).toBe(params.workshopId);
    expect(payload.nombre).toBe(params.nombre);
    expect(payload.telefono).toBe(params.telefono);
    expect(payload.email).toBe(params.email);
    expect(payload.licensePlate).toBe(params.licensePlate);
    expect(payload.status).toBe('PENDING');
  });
});
