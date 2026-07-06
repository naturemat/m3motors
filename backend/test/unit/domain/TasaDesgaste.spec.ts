import { TasaDesgaste } from '../../../src/domain/value-objects/TasaDesgaste';

describe('Objeto de Valor: TasaDesgaste', () => {
  test('Debería crear una instancia exitosamente con un porcentaje válido', () => {
    const tasaMinima = new TasaDesgaste(0);
    expect(tasaMinima.getPorcentaje()).toBe(0);

    const tasaMedia = new TasaDesgaste(45.5);
    expect(tasaMedia.getPorcentaje()).toBe(45.5);

    const tasaMaxima = new TasaDesgaste(100);
    expect(tasaMaxima.getPorcentaje()).toBe(100);
  });

  test('Debería lanzar un error si el porcentaje es menor a 0', () => {
    expect(() => new TasaDesgaste(-1)).toThrow(
      'Tasa de desgaste debe estar entre 0 y 100',
    );
  });

  test('Debería lanzar un error si el porcentaje es mayor a 100', () => {
    expect(() => new TasaDesgaste(100.1)).toThrow(
      'Tasa de desgaste debe estar entre 0 y 100',
    );
  });
});
