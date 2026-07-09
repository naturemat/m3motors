import { KilometrajeActualizadoEvent } from '../../../../src/registro-seguimiento/domain/events/KilometrajeActualizadoEvent';

describe('KilometrajeActualizadoEvent', () => {
  const params = {
    vehicleId: 'veh-001',
    placa: 'ABC-1234',
    nuevoKilometraje: 50000,
    kilometrajeAnterior: 45000,
    origenCaptura: 'INGRESO_TALLER' as const,
    fotoTableroUrl: 'https://example.com/foto.jpg',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new KilometrajeActualizadoEvent(params);

    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.placa).toBe(params.placa);
    expect(evento.nuevoKilometraje).toBe(params.nuevoKilometraje);
    expect(evento.kilometrajeAnterior).toBe(params.kilometrajeAnterior);
    expect(evento.origenCaptura).toBe(params.origenCaptura);
    expect(evento.fotoTableroUrl).toBe(params.fotoTableroUrl);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(KilometrajeActualizadoEvent.EVENT_NAME).toBe(
      'kilometraje.actualizado',
    );
  });

  it('debe ser inmutable', () => {
    const evento = new KilometrajeActualizadoEvent(params);

    expect(() => {
      (evento as any).placa = 'XYZ-9999';
    }).toThrow();
  });

  it('debe manejar fotoTableroUrl opcional como null', () => {
    const paramsSinFoto = { ...params, fotoTableroUrl: undefined };
    const evento = new KilometrajeActualizadoEvent(paramsSinFoto);

    expect(evento.fotoTableroUrl).toBeNull();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new KilometrajeActualizadoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('kilometraje.actualizado');
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.placa).toBe(params.placa);
    expect(payload.nuevoKilometraje).toBe(params.nuevoKilometraje);
    expect(payload.kilometrajeAnterior).toBe(params.kilometrajeAnterior);
    expect(payload.origenCaptura).toBe(params.origenCaptura);
    expect(payload.fotoTableroUrl).toBe(params.fotoTableroUrl);
  });
});
