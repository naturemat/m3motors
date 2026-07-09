import { MechanicAgregadoEvent } from '../../../../src/registro-seguimiento/domain/events/MechanicAgregadoEvent';

describe('MechanicAgregadoEvent', () => {
  const params = {
    mechanicId: 'mech-001',
    workshopId: 'wk-001',
    nombre: 'Juan Pérez',
    especialidad: 'Motor y Transmisión',
    usuarioId: 'user-001',
    creadoPor: 'owner-001',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new MechanicAgregadoEvent(params);

    expect(evento.mechanicId).toBe(params.mechanicId);
    expect(evento.workshopId).toBe(params.workshopId);
    expect(evento.nombre).toBe(params.nombre);
    expect(evento.especialidad).toBe(params.especialidad);
    expect(evento.usuarioId).toBe(params.usuarioId);
    expect(evento.creadoPor).toBe(params.creadoPor);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(MechanicAgregadoEvent.EVENT_NAME).toBe('mechanic.agregado');
  });

  it('debe ser inmutable', () => {
    const evento = new MechanicAgregadoEvent(params);

    expect(() => {
      (evento as any).nombre = 'Otro Nombre';
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new MechanicAgregadoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('mechanic.agregado');
    expect(payload.mechanicId).toBe(params.mechanicId);
    expect(payload.workshopId).toBe(params.workshopId);
    expect(payload.nombre).toBe(params.nombre);
    expect(payload.especialidad).toBe(params.especialidad);
    expect(payload.usuarioId).toBe(params.usuarioId);
    expect(payload.creadoPor).toBe(params.creadoPor);
  });
});
