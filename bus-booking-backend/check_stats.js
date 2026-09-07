const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://cms_user:cms_password@localhost:5434/bus_booking?schema=public' } } });

async function run() {
  const result = await prisma.$queryRawUnsafe('SELECT gateway, COUNT(*), SUM(amount) FROM "Payment" GROUP BY gateway');
  console.log(result);
}
run();
