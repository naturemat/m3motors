import { GeminiOCRService } from '../../../../src/registro-seguimiento/infrastructure/external-services/GeminiOCRService';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: 'PBA1234',
        }),
      },
    })),
  };
});

describe('GeminiOCRService', () => {
  let service: GeminiOCRService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    service = new GeminiOCRService();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('debe extraer una placa válida desde una imagen', async () => {
    const buffer = Buffer.from('fake-image-data');
    const resultado = await service.reconocerPlaca(buffer, 'image/jpeg');

    expect(resultado).toBe('PBA1234');
  });

  it('debe lanzar error si no hay API key configurada', () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => new GeminiOCRService()).toThrow('GEMINI_API_KEY no está configurada');
  });

  it('debe lanzar error si Gemini devuelve respuesta vacía', async () => {
    const { GoogleGenAI } = require('@google/genai');
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: '' }),
      },
    }));

    const svc = new GeminiOCRService();
    const buffer = Buffer.from('fake-image-data');

    await expect(svc.reconocerPlaca(buffer, 'image/jpeg')).rejects.toThrow(
      'No se pudo extraer ningún texto de placa de la imagen',
    );
  });
});
