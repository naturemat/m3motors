import { VehiculoActivadoEvent } from '../../../../src/registro-seguimiento/domain/events/VehiculoActivadoEvent';

describe('VehiculoActivadoEvent', () => {
  const params = {
    vehicleId: 'veh-001',
    clienteId: 'cli-001',
    placa: 'PBA-1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2020,
    tipoMotor: 'GASOLINA',
    activadoPor: 'mech-001',
    fotos: [
      { tipo: 'FRONTAL', url: 'https://example.com/frontal.jpg' },
      { tipo: 'LATERAL', url: 'https://example.com/lateral.jpg' },
      { tipo: 'PLACA', url: 'https://example.com/placa.jpg' },
    ],
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new VehiculoActivadoEvent(params);

    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.clienteId).toBe(params.clienteId);
    expect(evento.placa).toBe(params.placa);
    expect(evento.marca).toBe(params.marca);
    expect(evento.modelo).toBe(params.modelo);
    expect(evento.anio).toBe(params.anio);
    expect(evento.tipoMotor).toBe(params.tipoMotor);
    expect(evento.activadoPor).toBe(params.activadoPor);
    expect(evento.fotos).toHaveLength(3);
    expect(evento.fechaActivacion).toBeInstanceOf(Date);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(VehiculoActivadoEvent.EVENT_NAME).toBe('vehiculo.activado');
  });

  it('debe ser inmutable', () => {
    const evento = new VehiculoActivadoEvent(params);

    expect(() => {
      (evento as any).placa = 'XYZ-9999';
    }).toThrow();
  });

  it('debe congelar el array de fotos', () => {
    const evento = new VehiculoActivadoEvent(params);

    expect(() => {
      (evento.fotos as unknown[]).push({ tipo: 'TRASERA', url: 'x' });
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new VehiculoActivadoEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('vehiculo.activado');
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.clienteId).toBe(params.clienteId);
    expect(payload.placa).toBe(params.placa);
    expect(payload.marca).toBe(params.marca);
    expect(payload.modelo).toBe(params.modelo);
    expect(payload.anio).toBe(params.anio);
    expect(payload.tipoMotor).toBe(params.tipoMotor);
    expect(payload.activadoPor).toBe(params.activadoPor);
    expect(payload.fotos).toHaveLength(3);
    expect(payload.fechaActivacion).toBeInstanceOf(Date);
  });
});
