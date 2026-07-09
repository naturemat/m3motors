import { ClienteActivadoEvent } from '../../../../src/registro-seguimiento/domain/events/ClienteActivadoEvent';

describe('ClienteActivadoEvent', () => {
  const params = {
    clienteId: 'cli-001',
    preRegisteredCustomerId: 'pre-001',
    workshopId: 'wk-001',
    mechanicId: 'mech-001',
    nombre: 'Carlos López',
    telefono: '+593 98 765 4321',
    email: 'carlos@email.com',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new ClienteActivadoEvent(params);

    expect(evento.clienteId).toBe(params.clienteId);
    expect(evento.preRegisteredCustomerId).toBe(params.preRegisteredCustomerId);
    expect(evento.workshopId).toBe(params.workshopId);
    expect(evento.mechanicId).toBe(params.mechanicId);
    expect(evento.nombre).toBe(params.nombre);
    expect(evento.telefono).toBe(params.telefono);
    expect(evento.email).toBe(params.email);
    expect(evento.fechaActivacion).toBeInstanceOf(Date);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(ClienteActivadoEvent.EVENT_NAME).toBe('cliente.activado');
  });

  it('debe ser inmutable', () => {
    const evento = new ClienteActivadoEvent(params);

    expect(() => {
      (evento as unknown as { clienteId: string }).clienteId = 'cli-999';
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new ClienteActivadoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('cliente.activado');
    expect(payload.clienteId).toBe(params.clienteId);
    expect(payload.preRegisteredCustomerId).toBe(
      params.preRegisteredCustomerId,
    );
    expect(payload.workshopId).toBe(params.workshopId);
    expect(payload.mechanicId).toBe(params.mechanicId);
    expect(payload.nombre).toBe(params.nombre);
    expect(payload.telefono).toBe(params.telefono);
    expect(payload.email).toBe(params.email);
    expect(payload.fechaActivacion).toBeInstanceOf(Date);
  });
});
