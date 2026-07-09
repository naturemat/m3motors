import { AlertaGeneradaEvent } from '../../../../src/prediccion-analisis/domain/events/AlertaGeneradaEvent';

describe('AlertaGeneradaEvent', () => {
  const params = {
    vehicleId: 'veh-001',
    placa: 'ABC-1234',
    clienteId: 'cli-001',
    componenteAfectado: 'Filtro de aceite',
    kilometrajeActual: 48000,
    kilometrajeLimite: 55000,
    semanasEstimadasRestantes: 6,
    mesesEstimadosRestantes: 1,
    mensajePrediccion:
      'El filtro de aceite alcanzara su limite en aproximadamente 6 semanas.',
    nivelSeveridad: 'MEDIA' as const,
    recomendacion:
      'Programar cambio de filtro de aceite en las proximas 2 semanas.',
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new AlertaGeneradaEvent(params);

    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.placa).toBe(params.placa);
    expect(evento.clienteId).toBe(params.clienteId);
    expect(evento.componenteAfectado).toBe(params.componenteAfectado);
    expect(evento.kilometrajeActual).toBe(params.kilometrajeActual);
    expect(evento.kilometrajeLimite).toBe(params.kilometrajeLimite);
    expect(evento.semanasEstimadasRestantes).toBe(
      params.semanasEstimadasRestantes,
    );
    expect(evento.mesesEstimadosRestantes).toBe(params.mesesEstimadosRestantes);
    expect(evento.mensajePrediccion).toBe(params.mensajePrediccion);
    expect(evento.nivelSeveridad).toBe('MEDIA');
    expect(evento.recomendacion).toBe(params.recomendacion);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(AlertaGeneradaEvent.EVENT_NAME).toBe('alerta.generada');
  });

  it('debe ser inmutable', () => {
    const evento = new AlertaGeneradaEvent(params);

    expect(() => {
      (evento as unknown as { nivelSeveridad: string }).nivelSeveridad = 'BAJA';
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new AlertaGeneradaEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('alerta.generada');
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.placa).toBe(params.placa);
    expect(payload.clienteId).toBe(params.clienteId);
    expect(payload.componenteAfectado).toBe(params.componenteAfectado);
    expect(payload.nivelSeveridad).toBe('MEDIA');
    expect(payload.recomendacion).toBe(params.recomendacion);
  });
});
