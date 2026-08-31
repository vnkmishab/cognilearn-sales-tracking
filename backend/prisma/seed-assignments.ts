import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding site assignments...');

  // Get all employees and sites
  const employees = await prisma.employee.findMany();
  const sites = await prisma.site.findMany();

  const siteMap = new Map(sites.map(s => [s.siteCode, s.id]));
  const siteAId = siteMap.get('SIT-001');
  const siteBId = siteMap.get('SIT-002');
  const siteCId = siteMap.get('SIT-003');
  const siteDId = siteMap.get('SIT-004');

  for (const emp of employees) {
    // Delete existing assignments first
    await prisma.siteAssignment.deleteMany({
      where: { employeeId: emp.id }
    });

    const targetSiteIds: string[] = [];

    if (emp.employeeCode === 'EMP-0010') {
      // John Doe
      if (siteAId) targetSiteIds.push(siteAId);
      if (siteBId) targetSiteIds.push(siteBId);
    } else if (emp.employeeCode === 'EMP-001') {
      // Alice Smith
      if (siteAId) targetSiteIds.push(siteAId);
      if (siteCId) targetSiteIds.push(siteCId);
    } else if (emp.employeeCode === 'EMP-002') {
      // Bob Johnson
      if (siteBId) targetSiteIds.push(siteBId);
      if (siteDId) targetSiteIds.push(siteDId);
    } else {
      // Default: Site A
      if (siteAId) targetSiteIds.push(siteAId);
    }

    if (targetSiteIds.length > 0) {
      await prisma.siteAssignment.createMany({
        data: targetSiteIds.map(siteId => ({
          employeeId: emp.id,
          siteId
        }))
      });
      console.log(`Assigned ${targetSiteIds.length} sites to employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode})`);
    }
  }

  console.log('Seeding site assignments complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
