import { AlertaGeneradaEvent } from '../../../src/domain/events/AlertaGeneradaEvent';

describe('AlertaGeneradaEvent', () => {
  it('debe crear un evento con los atributos correctos', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new AlertaGeneradaEvent(
      'ABC-1234',
      'COMPONENTE_CRITICO',
      'El filtro de aceite requiere reemplazo inmediato',
      'ALTA',
      fecha,
    );

    expect(evento.placa).toBe('ABC-1234');
    expect(evento.tipo).toBe('COMPONENTE_CRITICO');
    expect(evento.mensaje).toBe(
      'El filtro de aceite requiere reemplazo inmediato',
    );
    expect(evento.nivel).toBe('ALTA');
    expect(evento.fecha).toBe(fecha);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(AlertaGeneradaEvent.EVENT_NAME).toBe('alerta.generada');
  });

  it('debe ser inmutable', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new AlertaGeneradaEvent(
      'ABC-1234',
      'COMPONENTE_CRITICO',
      'El filtro de aceite requiere reemplazo inmediato',
      'ALTA',
      fecha,
    );

    expect(() => {
      (evento as Record<string, unknown>).nivel = 'BAJA';
    }).toThrow();
  });
});
