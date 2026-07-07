import { GroqEngineInfoService } from '../../../../src/registro-seguimiento/infrastructure/external-services/GroqEngineInfoService';

describe('GroqEngineInfoService', () => {
  it('debe lanzar error si no hay API key configurada', () => {
    delete process.env.GROQ_API_KEY;
    expect(() => new GroqEngineInfoService()).toThrow('GROQ_API_KEY no está configurada');
  });
});
