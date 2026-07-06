import { IntervencionRegistradaEvent } from '../../../src/domain/events/IntervencionRegistradaEvent';

describe('IntervencionRegistradaEvent', () => {
  it('debe crear un evento con los atributos correctos', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new IntervencionRegistradaEvent(
      'INT-001',
      'ABC-1234',
      fecha,
      'Falla en el motor',
    );

    expect(evento.intervencionId).toBe('INT-001');
    expect(evento.placa).toBe('ABC-1234');
    expect(evento.fecha).toBe(fecha);
    expect(evento.diagnostico).toBe('Falla en el motor');
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(IntervencionRegistradaEvent.EVENT_NAME).toBe(
      'intervencion.registrada',
    );
  });

  it('debe ser inmutable', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new IntervencionRegistradaEvent(
      'INT-001',
      'ABC-1234',
      fecha,
      'Falla en el motor',
    );

    expect(() => {
      (evento as Record<string, unknown>).intervencionId = 'INT-999';
    }).toThrow();
  });
});
