const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Routes:");
  console.log(await prisma.route.findMany());
  console.log("\nSchedules:");
  console.log(await prisma.schedule.findMany());
}

main().finally(() => prisma.$disconnect());
