import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find employee EMP-0010
  const employee = await prisma.employee.findUnique({
    where: { employeeCode: 'EMP-0010' },
  });

  if (!employee) {
    console.error('Employee EMP-0010 not found. Run seed script first.');
    return;
  }

  // Create demo expenses
  const expenses = [
    {
      expenseCode: `EXP-DEMO-001`,
      employeeId: employee.id,
      category: 'TRAVEL',
      billAmount: 150.50,
      description: 'Flight to remote site',
      approvalStatus: 'APPROVED',
    },
    {
      expenseCode: `EXP-DEMO-002`,
      employeeId: employee.id,
      category: 'MEALS',
      billAmount: 45.00,
      description: 'Lunch with client',
      approvalStatus: 'PENDING',
    },
    {
      expenseCode: `EXP-DEMO-003`,
      employeeId: employee.id,
      category: 'SUPPLIES',
      billAmount: 320.75,
      description: 'Site safety equipment',
      approvalStatus: 'REJECTED',
    }
  ];

  for (const exp of expenses) {
    await prisma.expense.upsert({
      where: { expenseCode: exp.expenseCode },
      update: {},
      create: exp,
    });
  }

  console.log('Demo expenses seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
