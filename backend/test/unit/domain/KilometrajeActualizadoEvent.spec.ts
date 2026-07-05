import { KilometrajeActualizadoEvent } from '../../../src/domain/events/KilometrajeActualizadoEvent';

describe('KilometrajeActualizadoEvent', () => {
  it('debe crear un evento con los atributos correctos', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new KilometrajeActualizadoEvent('ABC-1234', 50000, fecha);

    expect(evento.placa).toBe('ABC-1234');
    expect(evento.nuevoKilometraje).toBe(50000);
    expect(evento.fecha).toBe(fecha);
  });

  it('debe tener un EVENT_NAME definido', () => {
    expect(KilometrajeActualizadoEvent.EVENT_NAME).toBe(
      'kilometraje.actualizado',
    );
  });

  it('debe ser inmutable', () => {
    const fecha = new Date('2026-07-05T10:00:00Z');
    const evento = new KilometrajeActualizadoEvent('ABC-1234', 50000, fecha);

    expect(() => {
      (evento as Record<string, unknown>).placa = 'XYZ-9999';
    }).toThrow();
  });
});
