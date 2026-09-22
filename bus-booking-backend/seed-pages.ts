import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const about = await prisma.cmsPage.findFirst({ where: { slug: 'about' } });
  if (!about) {
    await prisma.cmsPage.create({
      data: {
        slug: 'about',
        title: 'About Us',
        content: '<p>Welcome to Pokhara/Kathmandu Tourist Bus Booking. We provide comfortable and safe journeys across Nepal.</p>',
      }
    });
  }
  const contact = await prisma.cmsPage.findFirst({ where: { slug: 'contact' } });
  if (!contact) {
    await prisma.cmsPage.create({
      data: {
        slug: 'contact',
        title: 'Contact Us',
        content: '<p>Phone: +977 1234567890<br/>Email: booking@pokharatokathmandutouristbusbooking.com</p>',
      }
    });
  }
  console.log('Seeded pages');
}
main().catch(console.error).finally(() => prisma.$disconnect());
