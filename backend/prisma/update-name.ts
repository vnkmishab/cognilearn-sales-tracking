import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.update({
    where: { employeeCode: 'EMP-0010' },
    data: {
      firstName: 'John',
      lastName: 'Doe',
    }
  });

  console.log('Employee EMP-0010 name updated to John Doe');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
