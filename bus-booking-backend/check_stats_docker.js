const { PrismaClient } = require('@prisma/client');
// The container resolves 'postgres' via Docker DNS
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://cms_user:cms_password@postgres:5432/bus_booking?schema=public' } } });

async function main() {
  const result = await prisma.$queryRawUnsafe('SELECT gateway, COUNT(*), SUM(amount) FROM "Payment" GROUP BY gateway;');
  console.log('--- STATS ---');
  console.log(result);
  console.log('-------------');
}

main().catch(console.error).finally(() => prisma.$disconnect());
