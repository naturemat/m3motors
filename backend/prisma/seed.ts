/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = require('@prisma/client');

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL no configurada');

  // Usar puerto directo 5432 en lugar de pgbouncer 6543 para evitar auth issues
  const url = new URL(databaseUrl);
  const adapter = new PrismaPg({
    host: url.hostname,
    port: 5432,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

interface PartEntry {
  subcategoria: string;
  nombre: string;
  vidaUtilKm: number;
  vidaUtilDias: number | null;
  marcasComunes: string[];
}

// ── Groq API call helper ─────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada');

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Categories to seed ────────────────────────────────────────
const CATEGORIES = [
  'Motor',
  'Frenos',
  'Suspensión',
  'Sistema Eléctrico',
  'Transmisión',
  'Sistema de Enfriamiento',
  'Sistema de Escape',
  'Dirección',
  'Cuerpo y Carrocería',
  'Sistema de Combustible',
];

// ── Generate parts per category via Groq ──────────────────────
async function generatePartsForCategory(
  categoria: string,
): Promise<PartEntry[]> {
  const prompt = `Eres un experto en repuestos automotrices para el mercado ecuatoriano.
Genera una lista de repuestos comunes para la categoría "${categoria}" de vehículos.

Responde SOLO con un JSON válido, sin texto adicional:
{
  "parts": [
    {
      "subcategoria": "subcategoría del repuesto",
      "nombre": "nombre específico del repuesto",
      "vidaUtilKm": 15000,
      "vidaUtilDias": 365,
      "marcasComunes": ["Marca1", "Marca2", "Marca3"]
    }
  ]
}

Incluye entre 5 y 10 repuestos. Usa marcas reales disponibles en Ecuador.
Las vidas útiles deben ser realistas (ej: filtro de aceite ~10000km/180días, balatas ~40000km/365días).
Si un repuesto no aplica para vida útil en días, usa null en vidaUtilDias.`;

  const raw = await callGroq(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn(`⚠ Groq no devolvió JSON válido para categoría: ${categoria}`);
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.parts ?? []) as PartEntry[];
  } catch {
    console.warn(`⚠ Error parseando JSON para categoría: ${categoria}`);
    return [];
  }
}

// ── Upsert helper (handles null workshopId) ──────────────────
async function upsertPart(data: {
  workshopId: number | null;
  categoria: string;
  subcategoria: string;
  nombre: string;
  vidaUtilKm: number;
  vidaUtilDias: number | null;
  marcasComunes: string;
  notas?: string;
}) {
  const existing = await prisma.partsCatalog.findFirst({
    where: {
      workshopId: data.workshopId,
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      nombre: data.nombre,
    },
  });

  if (existing) return existing;

  // Para workshopId null, Prisma necesita que se excluya del data o se use connect
  const createData: any = {
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    nombre: data.nombre,
    vidaUtilKm: data.vidaUtilKm,
    vidaUtilDias: data.vidaUtilDias,
    marcasComunes: data.marcasComunes,
    notas: data.notas ?? null,
  };

  if (data.workshopId !== null) {
    createData.workshop = { connect: { id: data.workshopId } };
  }

  return prisma.partsCatalog.create({ data: createData });
}

// ── Main seed function ────────────────────────────────────────
async function main() {
  console.log('🔧 Iniciando seed de PartsCatalog...');

  let totalInserted = 0;

  for (const categoria of CATEGORIES) {
    console.log(`📦 Generando repuestos para: ${categoria}`);

    const parts = await generatePartsForCategory(categoria);

    for (const part of parts) {
      try {
        await upsertPart({
          workshopId: null,
          categoria,
          subcategoria: part.subcategoria,
          nombre: part.nombre,
          vidaUtilKm: part.vidaUtilKm,
          vidaUtilDias: part.vidaUtilDias,
          marcasComunes: JSON.stringify(part.marcasComunes),
        });
        totalInserted++;
      } catch (e: any) {
        console.error(`Error insertando ${part.nombre}:`, e.message);
      }
    }

    console.log(`  ✅ ${parts.length} repuestos procesados para ${categoria}`);
  }

  console.log(
    `\n🎉 Seed completado. Total repuestos procesados: ${totalInserted}`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
