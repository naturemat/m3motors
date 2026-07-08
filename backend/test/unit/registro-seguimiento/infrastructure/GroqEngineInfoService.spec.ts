import { GroqEngineInfoService } from '../../../../src/registro-seguimiento/infrastructure/external-services/GroqEngineInfoService';

describe('GroqEngineInfoService', () => {
  it('debe lanzar error si no hay API key configurada', async () => {
    delete process.env.GROQ_API_KEY;
    const svc = new GroqEngineInfoService();

    await expect(
      svc.obtenerSpecsMotor('TOYOTA', 'COROLLA', 2020),
    ).rejects.toThrow('GROQ_API_KEY no está configurada');
  });
});
