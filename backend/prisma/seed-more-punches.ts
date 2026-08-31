import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding realistic site punches and attendance events for other employees...');

  // Fetch employees and sites
  const employees = await prisma.employee.findMany();
  const sites = await prisma.site.findMany();

  if (employees.length === 0 || sites.length === 0) {
    console.error('Missing employees or sites in database! Please run db seed first.');
    return;
  }

  // Filter out EMP-0010 (John Doe) since he already has manual punches
  const otherEmployees = employees.filter(e => e.employeeCode !== 'EMP-0010');

  // Dates to seed: last 3 days
  const today = new Date();
  const dates = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  let punchesCreated = 0;
  let attendanceCreated = 0;

  for (const emp of otherEmployees) {
    for (const baseDate of dates) {
      // 85% chance they worked on this day
      if (Math.random() > 0.85) continue;

      // Pick a random site
      const site = sites[Math.floor(Math.random() * sites.length)];

      // Generate check-in time (e.g. 08:30 AM to 09:15 AM)
      const checkIn = new Date(baseDate);
      checkIn.setHours(8, 30 + Math.floor(Math.random() * 45), Math.floor(Math.random() * 60), 0);

      // Generate check-out time (e.g. 05:00 PM to 05:50 PM)
      const checkOut = new Date(baseDate);
      checkOut.setHours(17, Math.floor(Math.random() * 50), Math.floor(Math.random() * 60), 0);

      // 1. Create Attendance Event
      await prisma.attendanceEvent.create({
        data: {
          employeeId: emp.id,
          checkIn,
          checkOut,
          status: 'Present',
        }
      });
      attendanceCreated++;

      // 2. Create Site Punch IN
      const offsetLat = (Math.random() - 0.5) * 0.0002;
      const offsetLng = (Math.random() - 0.5) * 0.0002;
      await prisma.sitePunch.create({
        data: {
          clientPunchId: uuidv4(),
          employeeId: emp.id,
          siteId: site.id,
          punchType: 'IN',
          latitude: site.latitude ? site.latitude + offsetLat : 11.2479,
          longitude: site.longitude ? site.longitude + offsetLng : 75.8339,
          gpsAccuracy: 5 + Math.random() * 25,
          deviceId: 'mobile-app',
          syncedAt: checkIn,
        }
      });
      punchesCreated++;

      // 3. Create Site Punch OUT
      await prisma.sitePunch.create({
        data: {
          clientPunchId: uuidv4(),
          employeeId: emp.id,
          siteId: site.id,
          punchType: 'OUT',
          latitude: site.latitude ? site.latitude + offsetLat : 11.2479,
          longitude: site.longitude ? site.longitude + offsetLng : 75.8339,
          gpsAccuracy: 5 + Math.random() * 25,
          deviceId: 'mobile-app',
          syncedAt: checkOut,
        }
      });
      punchesCreated++;

      console.log(`Seeded history for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) at site: ${site.name}`);
    }
  }

  console.log(`Seeding complete. Created ${attendanceCreated} attendance events and ${punchesCreated} site punches.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
