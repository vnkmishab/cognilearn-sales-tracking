import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realSites = [
  { code: 'SIT-001', name: 'Golden Gate Bridge Rehab', projectId: 'PROJ-1' },
  { code: 'SIT-002', name: 'Empire State Retrofit', projectId: 'PROJ-2' },
  { code: 'SIT-003', name: 'Brooklyn Navy Yard', projectId: 'PROJ-3' },
  { code: 'SIT-004', name: 'Manhattan Highrise Hub', projectId: 'PROJ-4' },
  { code: 'SIT-005', name: 'Queens Subway Upgrade', projectId: 'PROJ-5' },
];

async function main() {
  console.log('Updating database site names to realistic construction site names...');

  for (const siteData of realSites) {
    const site = await prisma.site.findUnique({
      where: { siteCode: siteData.code },
    });

    if (site) {
      await prisma.site.update({
        where: { id: site.id },
        data: {
          name: siteData.name,
          projectId: siteData.projectId,
        },
      });
      console.log(`Updated ${siteData.code} name to: "${siteData.name}"`);
    } else {
      console.warn(`Site with code ${siteData.code} not found in database!`);
    }
  }

  console.log('Finished updating site names.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
