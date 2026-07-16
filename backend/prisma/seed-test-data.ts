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

// ── Helpers ───────────────────────────────────────────────────
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPlaca(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `${letters[randomInt(0,25)]}${letters[randomInt(0,25)]}${letters[randomInt(0,25)]}-${randomInt(1000,9999)}`;
}

// ── Test Data ─────────────────────────────────────────────────
const WORKSHOP = {
  nombre: 'Taller M3Motors Demo',
  ownerId: 'admin_clerk_test_001',
  clerkOrgId: 'org_test_demo_001',
  direccion: 'Av. Amazonas N36-50, Quito',
  telefono: '022345678',
  email: 'admin@m3motors.me',
};

const MECHANICS = [
  { clerkId: 'mechanic_clerk_001', nombre: 'Carlos Pérez', especialidad: 'Motor' },
  { clerkId: 'mechanic_clerk_002', nombre: 'Luis García', especialidad: 'Frenos' },
  { clerkId: 'mechanic_clerk_003', nombre: 'Miguel Rodríguez', especialidad: 'Suspensión' },
];

const CLIENTS = [
  { nombre: 'Ana Martínez', telefono: '0991234567', email: 'ana@test.com' },
  { nombre: 'Roberto Sánchez', telefono: '0987654321', email: 'roberto@test.com' },
  { nombre: 'María López', telefono: '0976543210', email: 'maria@test.com' },
  { nombre: 'Juan García', telefono: '0965432109', email: 'juan@test.com' },
  { nombre: 'Laura Hernández', telefono: '0954321098', email: 'laura@test.com' },
  { nombre: 'Pedro Díaz', telefono: '0943210987', email: 'pedro@test.com' },
];

const VEHICLES_DATA = [
  { marca: 'Toyota', modelo: 'Corolla', anio: 2020, tipoMotor: 'Gasolina' },
  { marca: 'Honda', modelo: 'Civic', anio: 2019, tipoMotor: 'Gasolina' },
  { marca: 'Hyundai', modelo: 'Accent', anio: 2021, tipoMotor: 'Gasolina' },
  { marca: 'Kia', modelo: 'Rio', anio: 2018, tipoMotor: 'Gasolina' },
  { marca: 'Chevrolet', modelo: 'Spark', anio: 2022, tipoMotor: 'Gasolina' },
  { marca: 'Nissan', modelo: 'Versa', anio: 2020, tipoMotor: 'Gasolina' },
];

const SERVICES = [
  { nombre: 'Cambio de aceite', categoria: 'Mantenimiento', precio: 25.00 },
  { nombre: 'Cambio de balatas', categoria: 'Frenos', precio: 45.00 },
  { nombre: 'Alineación y balance', categoria: 'Suspensión', precio: 35.00 },
  { nombre: 'Cambio de filtro de aire', categoria: 'Motor', precio: 15.00 },
  { nombre: 'Revisión de frenos', categoria: 'Frenos', precio: 20.00 },
];

const COMPONENTS = [
  { nombre: 'Filtro de aceite', vidaUtilKm: 10000 },
  { nombre: 'Balatas delanteras', vidaUtilKm: 40000 },
  { nombre: 'Filtro de aire', vidaUtilKm: 15000 },
  { nombre: 'Bujías', vidaUtilKm: 30000 },
  { nombre: 'Líquido de frenos', vidaUtilKm: 40000 },
];

const SEVERIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
const ESTADOS_ALERTA = ['ACTIVA', 'PENDIENTE', 'RESUELTA', 'VENCIDA'];

// ── Seed Functions ────────────────────────────────────────────
async function seedWorkshop() {
  console.log('🔧 Creando workshop...');
  
  let workshop = await prisma.workshop.findFirst({
    where: { email: WORKSHOP.email },
  });

  if (!workshop) {
    workshop = await prisma.workshop.create({ data: WORKSHOP });
    console.log('  ✅ Workshop creado');
  } else {
    console.log('  ℹ️ Workshop ya existe');
  }
  return workshop;
}

async function seedMechanics(workshopId: number) {
  console.log('👨‍🔧 Creando mecánicos...');
  const mechanics = [];
  
  for (const m of MECHANICS) {
    let existing = await prisma.mechanic.findFirst({
      where: { clerkId: m.clerkId },
    });

    if (!existing) {
      existing = await prisma.mechanic.create({
        data: {
          workshopId,
          clerkId: m.clerkId,
          nombre: m.nombre,
          especialidad: m.especialidad,
          activo: true,
          creadoPor: workshopId,
        },
      });
    }
    mechanics.push(existing);
  }
  
  console.log(`  ✅ ${mechanics.length} mecánicos`);
  return mechanics;
}

async function seedServices(workshopId: number) {
  console.log('📋 Creando servicios...');
  const services = [];
  
  for (const s of SERVICES) {
    let existing = await prisma.serviceCatalog.findFirst({
      where: { nombre: s.nombre, workshopId },
    });

    if (!existing) {
      existing = await prisma.serviceCatalog.create({
        data: {
          workshopId,
          nombre: s.nombre,
          categoria: s.categoria,
          precioReferencia: s.precio,
          activo: true,
        },
      });
    }
    services.push(existing);
  }
  
  console.log(`  ✅ ${services.length} servicios`);
  return services;
}

async function seedClients(mechanicId: number) {
  console.log('👥 Creando clientes...');
  const clients = [];
  
  for (const c of CLIENTS) {
    let existing = await prisma.cliente.findFirst({
      where: { email: c.email },
    });

    if (!existing) {
      existing = await prisma.cliente.create({
        data: {
          clerkId: `client_${c.email.replace('@', '_')}`,
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
          status: 'ACTIVATED',
          fechaActivacion: randomDate(new Date('2025-01-01'), new Date('2025-06-01')),
          idMecanicoActivo: mechanicId,
        },
      });
    }
    clients.push(existing);
  }
  
  console.log(`  ✅ ${clients.length} clientes`);
  return clients;
}

async function seedVehicles(clients: any[], mechanicId: number) {
  console.log('🚗 Creando vehículos...');
  const vehicles = [];
  
  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const v = VEHICLES_DATA[i % VEHICLES_DATA.length];
    
    let existing = await prisma.vehicle.findFirst({
      where: { clienteId: c.id },
    });

    if (!existing) {
      const kilometraje = randomInt(15000, 120000);
      existing = await prisma.vehicle.create({
        data: {
          clienteId: c.id,
          placa: randomPlaca(),
          marca: v.marca,
          modelo: v.modelo,
          anio: v.anio,
          tipoMotor: v.tipoMotor,
          status: 'ACTIVATED',
          fechaActivacion: c.fechaActivacion,
          idMecanicoActivo: mechanicId,
          ultimoKilometraje: kilometraje,
          tasaDesgasteKmSem: randomInt(80, 350),
          metodoCalculo: 'MATEMATICO',
          confianzaTasa: 0.75 + Math.random() * 0.2,
          fechaCalculoTasa: new Date(),
        },
      });
      
      // Create QR for vehicle
      const qrCode = `QR-${randomInt(1000,9999)}-${randomInt(1000,9999)}`;
      await prisma.vehicleQR.create({
        data: {
          vehiculoId: existing.id,
          codigo: qrCode,
          url: `https://m3motors.me/vehicle/${existing.id}`,
        },
      });
    }
    vehicles.push(existing);
  }
  
  console.log(`  ✅ ${vehicles.length} vehículos con QR`);
  return vehicles;
}

async function seedInterventions(vehicles: any[], mechanics: any[], services: any[]) {
  console.log('🔧 Creando intervenciones...');
  const interventions = [];
  const now = new Date();
  
  // 12 meses de historial
  for (let month = 0; month < 12; month++) {
    const count = randomInt(3, 8);
    
    for (let i = 0; i < count; i++) {
      const vehicle = vehicles[randomInt(0, vehicles.length - 1)];
      const mechanic = mechanics[randomInt(0, mechanics.length - 1)];
      const service = services[randomInt(0, services.length - 1)];
      
      const fecha = new Date(now);
      fecha.setMonth(fecha.getMonth() - month);
      fecha.setDate(randomInt(1, 28));
      
      const intervencion = await prisma.intervention.create({
        data: {
          vehiculoId: vehicle.id,
          mecanicoId: mechanic.id,
          serviceCatalogId: service.id,
          fecha,
          kilometrajeOdometro: vehicle.ultimoKilometraje - (month * randomInt(500, 2000)),
          diagnostico: service.nombre,
          severidad: SEVERIDADES[randomInt(0, 3)],
          manoDeObra: Number(service.precioReferencia) * (0.8 + Math.random() * 0.4),
          estado: 'COMPLETADA',
          tipoIntervencion: month % 3 === 0 ? 'CORRECTIVO' : 'PREVENTIVO',
        },
      });
      interventions.push(intervencion);
    }
  }
  
  console.log(`  ✅ ${interventions.length} intervenciones`);
  return interventions;
}

async function seedAlertas(vehicles: any[], interventions: any[]) {
  console.log('⚠️ Creando alertas...');
  let count = 0;
  
  for (const vehicle of vehicles) {
    const numAlertas = randomInt(1, 3);
    
    for (let i = 0; i < numAlertas; i++) {
      const intervention = interventions[randomInt(0, interventions.length - 1)];
      const component = COMPONENTS[randomInt(0, COMPONENTS.length - 1)];
      
      await prisma.alertaPredictiva.create({
        data: {
          vehiculoId: vehicle.id,
          intervencionId: intervention.id,
          componenteAfectado: component.nombre,
          kilometrajeActual: vehicle.ultimoKilometraje,
          kilometrajeLimite: vehicle.ultimoKilometraje + randomInt(5000, 20000),
          semanasEstimadas: randomInt(2, 16),
          mesesEstimados: randomInt(1, 4),
          mensajePrediccion: `${component.nombre} requiere reemplazo pronto`,
          severidad: SEVERIDADES[randomInt(0, 3)],
          recomendacion: `Programar cambio de ${component.nombre}`,
          estadoAlerta: ESTADOS_ALERTA[randomInt(0, 3)],
          fechaEstimada: new Date(Date.now() + randomInt(14, 120) * 24 * 60 * 60 * 1000),
          kilometrajeProyectado: vehicle.ultimoKilometraje + randomInt(5000, 20000),
        },
      });
      count++;
    }
  }
  
  console.log(`  ✅ ${count} alertas`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Iniciando seed de datos de prueba...\n');
  
  try {
    const workshop = await seedWorkshop();
    const mechanics = await seedMechanics(workshop.id);
    await seedServices(workshop.id);
    const clients = await seedClients(mechanics[0].id);
    const vehicles = await seedVehicles(clients, mechanics[0].id);
    const interventions = await seedInterventions(vehicles, mechanics, await prisma.serviceCatalog.findMany({ where: { workshopId: workshop.id } }));
    await seedAlertas(vehicles, interventions);
    
    console.log('\n🎉 ¡Seed completado!');
    console.log('📊 Datos creados para testing de KPIs:');
    console.log(`   - Workshop: ${WORKSHOP.nombre}`);
    console.log(`   - Mecánicos: ${mechanics.length}`);
    console.log(`   - Clientes: ${clients.length}`);
    console.log(`   - Vehículos: ${vehicles.length}`);
    console.log(`   - Intervenciones: ${interventions.length}`);
    console.log(`   - Alertas: ver arriba`);
    console.log('\n💡 Ahora ejecuta: npm run start:dev');
    console.log('   Y prueba: GET /admin/kpis con token de Clerk\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
