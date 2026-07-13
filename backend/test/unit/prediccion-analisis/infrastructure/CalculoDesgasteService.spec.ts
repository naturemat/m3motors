import { CalculoDesgasteService } from '../../../../src/prediccion-analisis/infrastructure/CalculoDesgasteService';
import { RegistroKilometraje } from '../../../../src/registro-seguimiento/domain/value-objects/RegistroKilometraje';

function crearRegistro(km: number, diasAtras: number): RegistroKilometraje {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  return new RegistroKilometraje(km, fecha);
}

describe('CalculoDesgasteService', () => {
  let service: CalculoDesgasteService;

  beforeEach(() => {
    service = new CalculoDesgasteService();
  });

  describe('calcularTasaSemanal', () => {
    it('debería retornar tasa 0 con menos de 3 registros', () => {
      const registros = [crearRegistro(80000, 90), crearRegistro(90000, 30)];

      const tasa = service.calcularTasaSemanal(registros);

      expect(tasa.getKilometrosSemanales()).toBe(0);
      expect(tasa.getNivelConfianza()).toBe(0);
    });

    it('debería calcular tasa con 3 registros usando promedio movil', () => {
      const registros = [
        crearRegistro(80000, 60),
        crearRegistro(90000, 30),
        crearRegistro(100000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      expect(tasa.getKilometrosSemanales()).toBeGreaterThan(1000);
      expect(tasa.getKilometrosSemanales()).toBeLessThan(5000);
      expect(tasa.getMetodo()).toBe('PROMEDIO_MOVIL_DISCRETO');
    });

    it('debería calcular tasa con promedio movil cuando hay poco espaciado', () => {
      // Registros muy juntos (menos de 7 días entre algunos)
      const registros = [
        crearRegistro(80000, 10),
        crearRegistro(85000, 5),
        crearRegistro(90000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      // Con promedio movil: (90000-80000) / ~1.4 semanas = ~7000
      expect(tasa.getKilometrosSemanales()).toBeGreaterThan(0);
      expect(tasa.getMetodo()).toBe('PROMEDIO_MOVIL_DISCRETO');
    });

    it('debería excluir outliers automáticamente', () => {
      // Registro con salto sospechoso (outlier)
      const registros = [
        crearRegistro(80000, 60),
        crearRegistro(90000, 30),
        crearRegistro(200000, 15), // outlier: salto de 110k en 15 días
        crearRegistro(100000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      // El outlier debe ser excluido, la tasa debe ser razonable
      expect(tasa.getKilometrosSemanales()).toBeGreaterThan(0);
      expect(tasa.getKilometrosSemanales()).toBeLessThan(10000);
    });

    it('debería retornar tasa 0 con registros en misma fecha', () => {
      const registros = [
        crearRegistro(80000, 0),
        crearRegistro(90000, 0),
        crearRegistro(100000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      expect(tasa.getKilometrosSemanales()).toBe(0);
    });

    it('debería calcular correctamente con 6+ registros', () => {
      const registros = [
        crearRegistro(70000, 180),
        crearRegistro(80000, 150),
        crearRegistro(90000, 120),
        crearRegistro(100000, 90),
        crearRegistro(110000, 60),
        crearRegistro(120000, 30),
        crearRegistro(130000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      // ~3333 km/sem (60000 km / 18 semanas)
      expect(tasa.getKilometrosSemanales()).toBeGreaterThan(2000);
      expect(tasa.getKilometrosSemanales()).toBeLessThan(5000);
      expect(tasa.getMetodo()).toBe('REGRESION_LINEAL');
      expect(tasa.getNivelConfianza()).toBeGreaterThan(0.5);
    });

    it('debería manejar registros desordenados', () => {
      const registros = [
        crearRegistro(100000, 0),
        crearRegistro(80000, 60),
        crearRegistro(90000, 30),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      expect(tasa.getKilometrosSemanales()).toBeGreaterThan(0);
    });

    it('debería calcular confianza baja con pocos registros', () => {
      const registros = [
        crearRegistro(80000, 30),
        crearRegistro(90000, 15),
        crearRegistro(100000, 0),
      ];

      const tasa = service.calcularTasaSemanal(registros);

      // 3 registros = confianza penalizada
      expect(tasa.getNivelConfianza()).toBeLessThan(1);
    });
  });
});
