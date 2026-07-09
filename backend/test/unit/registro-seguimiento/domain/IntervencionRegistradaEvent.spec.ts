import { IntervencionRegistradaEvent } from '../../../../src/registro-seguimiento/domain/events/IntervencionRegistradaEvent';

describe('IntervencionRegistradaEvent', () => {
  const params = {
    intervencionId: 'int-001',
    vehicleId: 'veh-001',
    placa: 'ABC-1234',
    mecanicoId: 'mech-001',
    workshopId: 'wk-001',
    diagnostico: {
      fallaDetectada: 'Desgaste de pastillas de freno',
      observacionesMecanico: 'Frenos delanteros con desgaste avanzado',
      nivelSeveridad: 'ALTA' as const,
    },
    componentesSustituidos: [
      {
        componenteId: 'comp-001',
        nombre: 'Pastillas de freno delanteras',
        kilometrajeInstalacion: 45000,
        limiteKilometrajeFabricante: 60000,
      },
    ],
    manoDeObra: 85.5,
  };

  it('debe crear un evento con los atributos correctos', () => {
    const evento = new IntervencionRegistradaEvent(params);

    expect(evento.intervencionId).toBe(params.intervencionId);
    expect(evento.vehicleId).toBe(params.vehicleId);
    expect(evento.placa).toBe(params.placa);
    expect(evento.mecanicoId).toBe(params.mecanicoId);
    expect(evento.workshopId).toBe(params.workshopId);
    expect(evento.diagnostico.fallaDetectada).toBe(
      params.diagnostico.fallaDetectada,
    );
    expect(evento.diagnostico.nivelSeveridad).toBe('ALTA');
    expect(evento.componentesSustituidos).toHaveLength(1);
    expect(evento.manoDeObra).toBe(85.5);
    expect(evento.eventId).toBeDefined();
    expect(evento.occurredOn).toBeInstanceOf(Date);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(IntervencionRegistradaEvent.EVENT_NAME).toBe(
      'intervencion.registrada',
    );
  });

  it('debe ser inmutable', () => {
    const evento = new IntervencionRegistradaEvent(params);

    expect(() => {
      (evento as any).placa = 'XYZ-9999';
    }).toThrow();
  });

  it('debe congelar diagnostico y componentes', () => {
    const evento = new IntervencionRegistradaEvent(params);

    expect(() => {
      (evento.diagnostico as any).fallaDetectada = 'Otra';
    }).toThrow();

    expect(() => {
      (evento.componentesSustituidos as unknown[]).push({
        componenteId: 'x',
        nombre: 'x',
        kilometrajeInstalacion: 0,
        limiteKilometrajeFabricante: 0,
      });
    }).toThrow();
  });

  it('debe generar payload con toPayload()', () => {
    const evento = new IntervencionRegistradaEvent(params);
    const payload = evento.toPayload();

    expect(payload.eventId).toBe(evento.eventId);
    expect(payload.eventName).toBe('intervencion.registrada');
    expect(payload.intervencionId).toBe(params.intervencionId);
    expect(payload.vehicleId).toBe(params.vehicleId);
    expect(payload.placa).toBe(params.placa);
    expect(payload.mecanicoId).toBe(params.mecanicoId);
    expect(payload.workshopId).toBe(params.workshopId);
    expect(payload.diagnostico).toEqual(params.diagnostico);
    expect(payload.manoDeObra).toBe(params.manoDeObra);
  });
});
