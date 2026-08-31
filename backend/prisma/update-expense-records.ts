import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating database seeded expense records to match mock-receipt proof (EXP-1001)...');

  const receiptDate = new Date('2023-10-26T12:44:00Z');

  // 1. Update EXP-1001 (Matched: both bill and payment amounts match receipt total $178.74)
  const exp1001 = await prisma.expense.findUnique({
    where: { expenseCode: 'EXP-1001' },
  });

  if (exp1001) {
    await prisma.expense.update({
      where: { id: exp1001.id },
      data: {
        billAmount: 178.74,
        paymentAmount: 178.74,
        createdAt: receiptDate,
      },
    });

    await prisma.expenseDocument.updateMany({
      where: { expenseId: exp1001.id },
      data: {
        createdAt: receiptDate,
      },
    });

    console.log('Successfully updated EXP-1001 (Matched) amounts and dates.');
  } else {
    console.warn('Expense EXP-1001 not found.');
  }

  // 2. Update EXP-1002 (Mismatched: billAmount matches receipt $178.74, paymentAmount is different: $150.00)
  const exp1002 = await prisma.expense.findUnique({
    where: { expenseCode: 'EXP-1002' },
  });

  if (exp1002) {
    await prisma.expense.update({
      where: { id: exp1002.id },
      data: {
        billAmount: 178.74,
        paymentAmount: 150.00,
        createdAt: receiptDate,
      },
    });

    await prisma.expenseDocument.updateMany({
      where: { expenseId: exp1002.id },
      data: {
        createdAt: receiptDate,
      },
    });

    console.log('Successfully updated EXP-1002 (Mismatched) amounts and dates.');
  } else {
    console.warn('Expense EXP-1002 not found.');
  }

  console.log('Database update finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
