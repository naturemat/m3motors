import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaPg({
  host: url.hostname,
  port: parseInt(url.port, 10) || 5432,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Buscando clientes sin passwordHash...');

  const clients = await prisma.cliente.findMany({
    where: { passwordHash: null },
  });

  console.log(`Clientes sin password: ${clients.length}`);

  for (const client of clients) {
    const tempPassword = `Clie${client.id}1234!`;
    const hash = await bcrypt.hash(tempPassword, 10);

    await prisma.cliente.update({
      where: { id: client.id },
      data: { passwordHash: hash },
    });

    console.log(`  ${client.nombre} (${client.email}) -> password: ${tempPassword}`);
  }

  console.log('\nListo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
