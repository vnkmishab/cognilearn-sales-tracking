import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realEmployees = [
  { code: 'EMP-001', firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@fieldops.com' },
  { code: 'EMP-002', firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@fieldops.com' },
  { code: 'EMP-003', firstName: 'Charlie', lastName: 'Miller', email: 'charlie.miller@fieldops.com' },
  { code: 'EMP-004', firstName: 'Diana', lastName: 'Davis', email: 'diana.davis@fieldops.com' },
  { code: 'EMP-005', firstName: 'Ethan', lastName: 'Garcia', email: 'ethan.garcia@fieldops.com' },
  { code: 'EMP-006', firstName: 'Fiona', lastName: 'Rodriguez', email: 'fiona.rodriguez@fieldops.com' },
  { code: 'EMP-007', firstName: 'George', lastName: 'Wilson', email: 'george.wilson@fieldops.com' },
  { code: 'EMP-008', firstName: 'Hannah', lastName: 'Martinez', email: 'hannah.martinez@fieldops.com' },
  { code: 'EMP-009', firstName: 'Ian', lastName: 'Anderson', email: 'ian.anderson@fieldops.com' },
  { code: 'EMP-0010', firstName: 'John', lastName: 'Doe', email: 'john.doe@fieldops.com' },
];

async function main() {
  console.log('Starting migration to realistic employee names and emails...');

  for (const empData of realEmployees) {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode: empData.code },
      include: { user: true }
    });

    if (employee) {
      // Update employee name
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          firstName: empData.firstName,
          lastName: empData.lastName,
        }
      });

      // Update user email
      await prisma.user.update({
        where: { id: employee.userId },
        data: {
          email: empData.email,
        }
      });

      console.log(`Updated ${empData.code} to ${empData.firstName} ${empData.lastName} (${empData.email})`);
    } else {
      console.warn(`Employee with code ${empData.code} not found!`);
    }
  }

  console.log('Finished updating employees.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
