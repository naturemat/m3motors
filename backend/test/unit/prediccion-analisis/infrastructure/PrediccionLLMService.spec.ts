import { PrediccionLLMService } from '../../../../src/prediccion-analisis/infrastructure/PrediccionLLMService';
import { ContextoVehiculo } from '../../../../src/prediccion-analisis/domain/domain-services/ServicioPrediccionLLM';

function crearContexto(overrides?: Partial<ContextoVehiculo>): ContextoVehiculo {
  return {
    vehicleId: '1',
    placa: 'ABC-1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2018,
    kilometrajeActual: 100000,
    kmPorSemana: 800,
    componentesCriticos: [
      {
        nombre: 'Filtro de aceite',
        kilometrajeInstalacion: 90000,
        limiteKilometraje: 10000,
      },
      {
        nombre: 'Pastillas freno',
        kilometrajeInstalacion: 70000,
        limiteKilometraje: 30000,
      },
    ],
    ...overrides,
  };
}

describe('PrediccionLLMService', () => {
  let service: PrediccionLLMService;

  beforeEach(() => {
    service = new PrediccionLLMService();
  });

  describe('predicción matemática (fallback)', () => {
    it('debería calcular predicción cuando no hay Groq API', async () => {
      delete process.env.GROQ_API_KEY;

      const contexto = crearContexto();
      const resultado = await service.predecir(contexto);

      expect(resultado.componenteAfectado).toBeDefined();
      expect(resultado.severidad).toBeDefined();
      expect(['BAJA', 'MEDIA', 'CRITICA']).toContain(resultado.severidad);
    });

    it('debería detectar componente CRITICO vencido', async () => {
      delete process.env.GROQ_API_KEY;

      const contexto = crearContexto({
        kilometrajeActual: 105000,
        componentesCriticos: [
          {
            nombre: 'Filtro de aceite',
            kilometrajeInstalacion: 90000,
            limiteKilometraje: 10000,
          },
        ],
      });

      const resultado = await service.predecir(contexto);

      expect(resultado.severidad).toBe('CRITICA');
      expect(resultado.semanasEstimadas).toBe(0);
    });

    it('debería detectar componente en MEDIA', async () => {
      delete process.env.GROQ_API_KEY;

      const contexto = crearContexto({
        kilometrajeActual: 98000,
        componentesCriticos: [
          {
            nombre: 'Pastillas freno',
            kilometrajeInstalacion: 70000,
            limiteKilometraje: 30000,
          },
        ],
      });

      const resultado = await service.predecir(contexto);

      // 98000 - 70000 = 28000 / 30000 = 93.3% → MEDIA
      expect(resultado.severidad).toBe('MEDIA');
    });

    it('debería retornar BAJA para componente con poco desgaste', async () => {
      delete process.env.GROQ_API_KEY;

      const contexto = crearContexto({
        kilometrajeActual: 80000,
        componentesCriticos: [
          {
            nombre: 'Correa distribución',
            kilometrajeInstalacion: 20000,
            limiteKilometraje: 80000,
          },
        ],
      });

      const resultado = await service.predecir(contexto);

      expect(resultado.severidad).toBe('BAJA');
      expect(resultado.semanasEstimadas).toBeGreaterThan(12);
    });

    it('debería seleccionar el componente más crítico', async () => {
      delete process.env.GROQ_API_KEY;

      const contexto = crearContexto({
        kilometrajeActual: 100000,
        componentesCriticos: [
          {
            nombre: 'Filtro aceite (OK)',
            kilometrajeInstalacion: 95000,
            limiteKilometraje: 10000,
          },
          {
            nombre: 'Pastillas freno (CRITICO)',
            kilometrajeInstalacion: 70000,
            limiteKilometraje: 30000,
          },
        ],
      });

      const resultado = await service.predecir(contexto);

      expect(resultado.componenteAfectado).toBe('Pastillas freno (CRITICO)');
    });
  });
});
