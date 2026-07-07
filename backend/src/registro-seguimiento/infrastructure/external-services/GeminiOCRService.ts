import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { IOCRService } from '../../domain/ports/services/IOCRService';

@Injectable()
export class GeminiOCRService implements IOCRService {
  private readonly ai: GoogleGenAI;
  private readonly model = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY no está configurada en el entorno');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async reconocerPlaca(imagenBuffer: Buffer, mimeType: string): Promise<string> {
    const imagenBase64 = imagenBuffer.toString('base64');

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          inlineData: { data: imagenBase64, mimeType },
        },
        'Identifica la placa de este auto en Ecuador (formato de 3 letras y 4 números). ' +
          'Devuelve única y exclusivamente el texto de la placa limpio, sin espacios ni guiones.',
      ],
      config: { temperature: 0.1 },
    });

    const placa = response.text?.trim() ?? '';
    if (!placa) throw new Error('No se pudo extraer ningún texto de placa de la imagen');

    return placa;
  }
}
