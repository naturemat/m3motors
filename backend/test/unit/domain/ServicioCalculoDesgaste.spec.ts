import { ServicioCalculoDesgaste } from '../../../src/domain/domain-services/ServicioCalculoDesgaste';
import { RegistroKilometraje } from '../../../src/domain/value-objects/RegistroKilometraje';

describe('Servicio de Dominio: ServicioCalculoDesgaste', () => {
  let servicio: ServicioCalculoDesgaste;

  beforeEach(() => {
    servicio = new ServicioCalculoDesgaste();
  });

  test('Debería retornar 0% de desgaste si hay menos de 2 registros', () => {
    const registros: RegistroKilometraje[] = [
      new RegistroKilometraje(10000, new Date('2026-07-01')),
    ];
    const tasa = servicio.calcular(registros);
    expect(tasa.getPorcentaje()).toBe(0);
  });

  test('Debería calcular correctamente la tasa basada en el avance de kilómetros semanales', () => {
    const registros = [
      new RegistroKilometraje(10000, new Date('2026-07-01T00:00:00Z')),
      new RegistroKilometraje(11000, new Date('2026-07-15T00:00:00Z')),
    ];

    const tasa = servicio.calcular(registros);
    expect(tasa.getPorcentaje()).toBeCloseTo(50, 1);
  });

  test('Debería topar el desgaste en 100% si el uso supera la referencia máxima', () => {
    const registros = [
      new RegistroKilometraje(10000, new Date('2026-07-01T00:00:00Z')),
      new RegistroKilometraje(13000, new Date('2026-07-08T00:00:00Z')),
    ];

    const tasa = servicio.calcular(registros);
    expect(tasa.getPorcentaje()).toBe(100);
  });
});
