import { Injectable } from '@nestjs/common';
import {
  IEngineInfoService,
  EngineSpecs,
} from '../../domain/ports/services/IEngineInfoService';

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices: GroqChoice[];
}

@Injectable()
export class GroqEngineInfoService implements IEngineInfoService {
  private readonly apiKey: string;
  private readonly model = 'llama-3.3-70b-versatile';
  private readonly url = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? '';
    if (!this.apiKey)
      throw new Error('GROQ_API_KEY no está configurada en el entorno');
  }

  async obtenerSpecsMotor(
    marca: string,
    modelo: string,
    anio: number,
  ): Promise<EngineSpecs> {
    const prompt = `Dame las especificaciones del motor de este vehículo. Responde SOLO con un JSON válido, sin texto adicional:
{
  "cilindrada": "ej: 1.6L",
  "cilindros": "ej: 4 cilindros en línea",
  "distribucion": "ej: DOHC 16 válvulas"
}

Vehículo: ${marca} ${modelo} ${anio}`;

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en Groq API: ${response.status}`);
    }

    const data = (await response.json()) as GroqResponse;
    const contenido = data.choices?.[0]?.message?.content ?? '';

    const jsonMatch = contenido.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Groq no devolvió un JSON válido');

    const specs = JSON.parse(jsonMatch[0]) as EngineSpecs;

    return {
      cilindrada: specs.cilindrada ?? 'N/A',
      cilindros: specs.cilindros ?? 'N/A',
      distribucion: specs.distribucion ?? 'N/A',
    };
  }
}
