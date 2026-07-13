import { Injectable, Logger } from '@nestjs/common';
import {
  ServicioPrediccionLLM,
  ContextoVehiculo,
  AlertaPrediccion,
} from '../domain/domain-services/ServicioPrediccionLLM';

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices: GroqChoice[];
}

interface LLMResponse {
  predicciones: {
    componente: string;
    kilometrosRestantes: number;
    semanasEstimadas: number;
    mesesEstimados: number;
    severidad: 'BAJA' | 'MEDIA' | 'CRITICA';
    recomendacion: string;
    razon: string;
  }[];
}

@Injectable()
export class PrediccionLLMService implements ServicioPrediccionLLM {
  private readonly logger = new Logger(PrediccionLLMService.name);
  private readonly model = 'llama-3.3-70b-versatile';
  private readonly url = 'https://api.groq.com/openai/v1/chat/completions';

  async predecir(contexto: ContextoVehiculo): Promise<AlertaPrediccion> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY no configurada — usando predicción matemática',
      );
      return this.prediccionMatematica(contexto);
    }

    try {
      const prompt = this.construirPrompt(contexto);
      const respuesta = await this.llamarGroq(prompt, apiKey);
      return this.parsearRespuesta(respuesta, contexto);
    } catch (error) {
      this.logger.error(`Error en predicción LLM: ${String(error)}`);
      return this.prediccionMatematica(contexto);
    }
  }

  private construirPrompt(contexto: ContextoVehiculo): string {
    const componentes = contexto.componentesCriticos
      .map(
        (c) =>
          `- ${c.nombre}: instalado a ${c.kilometrajeInstalacion.toLocaleString()} km, límite ${c.limiteKilometraje.toLocaleString()} km`,
      )
      .join('\n');

    return `Eres un experto mecánico automotriz en Ecuador. Analiza el estado de los componentes de este vehículo y predice cuándo necesitarán mantenimiento.

VEHÍCULO: ${contexto.marca} ${contexto.modelo} ${contexto.anio}
KILOMETRAJE ACTUAL: ${contexto.kilometrajeActual.toLocaleString()} km
PLACA: ${contexto.placa}

COMPONENTES CRÍTICOS:
${componentes}

Para cada componente, calcula:
1. Kilómetros restantes hasta el límite
2. Semanas estimadas restantes (basado en el kilometraje actual)
3. Meses estimados restantes
4. Severidad: BAJA (<80%), MEDIA (80-94%), CRITICA (≥95% o vencido)
5. Recomendación específica para Ecuador (disponibilidad de repuestos, talleres recomendados)

Responde SOLO con un JSON válido:
{
  "predicciones": [
    {
      "componente": "nombre del componente",
      "kilometrosRestantes": 5000,
      "semanasEstimadas": 7,
      "mesesEstimados": 2,
      "severidad": "MEDIA",
      "recomendacion": "Programar cambio en las próximas 2 semanas",
      "razon": "El componente está al 83% de su vida útil"
    }
  ]
}

Si un componente ya venció, pon kilometrosRestantes en 0 y severidad en CRITICA.`;
  }

  private async llamarGroq(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = (await response.json()) as GroqResponse;
    return data.choices?.[0]?.message?.content ?? '';
  }

  private parsearRespuesta(
    respuesta: string,
    contexto: ContextoVehiculo,
  ): AlertaPrediccion {
    const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLM no devolvió JSON válido');
    }

    const parsed = JSON.parse(jsonMatch[0]) as LLMResponse;
    const predicciones = parsed.predicciones ?? [];

    if (predicciones.length === 0) {
      return this.prediccionMatematica(contexto);
    }

    const principal = predicciones.reduce((peor, actual) => {
      const orden = { CRITICA: 3, MEDIA: 2, BAJA: 1 };
      return (orden[actual.severidad] ?? 0) > (orden[peor.severidad] ?? 0)
        ? actual
        : peor;
    });

    return {
      componenteAfectado: principal.componente,
      kilometrajeActual: contexto.kilometrajeActual,
      kilometrajeLimite:
        contexto.componentesCriticos.find(
          (c) => c.nombre === principal.componente,
        )?.limiteKilometraje ?? 0,
      semanasEstimadas: principal.semanasEstimadas,
      mesesEstimados: principal.mesesEstimados,
      mensajePrediccion: principal.razon,
      severidad: principal.severidad,
      recomendacion: principal.recomendacion,
    };
  }

  private prediccionMatematica(contexto: ContextoVehiculo): AlertaPrediccion {
    let peorComponente = contexto.componentesCriticos[0];
    let peorPorcentaje = 0;

    for (const c of contexto.componentesCriticos) {
      const recorrido = contexto.kilometrajeActual - c.kilometrajeInstalacion;
      const porcentaje = (recorrido / c.limiteKilometraje) * 100;
      if (porcentaje > peorPorcentaje) {
        peorPorcentaje = porcentaje;
        peorComponente = c;
      }
    }

    const kmRestantes =
      peorComponente.limiteKilometraje -
      (contexto.kilometrajeActual - peorComponente.kilometrajeInstalacion);
    const kmPorSemana = 800;
    const semanas = kmRestantes > 0 ? Math.floor(kmRestantes / kmPorSemana) : 0;
    const meses = Math.floor(semanas / 4);

    let severidad: 'BAJA' | 'MEDIA' | 'CRITICA' = 'BAJA';
    if (peorPorcentaje >= 95 || kmRestantes <= 0) severidad = 'CRITICA';
    else if (peorPorcentaje >= 85) severidad = 'MEDIA';

    return {
      componenteAfectado: peorComponente.nombre,
      kilometrajeActual: contexto.kilometrajeActual,
      kilometrajeLimite: peorComponente.limiteKilometraje,
      semanasEstimadas: semanas,
      mesesEstimados: meses,
      mensajePrediccion: `El componente ${peorComponente.nombre} está al ${peorPorcentaje.toFixed(1)}% de desgaste.`,
      severidad,
      recomendacion:
        severidad === 'CRITICA'
          ? 'Requiere reemplazo inmediato'
          : `Programar mantenimiento en ${semanas} semanas`,
    };
  }
}
