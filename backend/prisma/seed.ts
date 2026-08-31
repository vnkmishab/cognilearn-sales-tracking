import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Users ---
  // 1 Admin
  const admin = await prisma.user.create({
    data: { email: 'admin@fieldops.com', passwordHash: 'hashed_password', role: 'ADMIN' },
  });

  // 2 Accounts Users
  const acc1 = await prisma.user.create({
    data: { email: 'acc1@fieldops.com', passwordHash: 'hashed_password', role: 'ACCOUNTS' },
  });
  const acc2 = await prisma.user.create({
    data: { email: 'acc2@fieldops.com', passwordHash: 'hashed_password', role: 'ACCOUNTS' },
  });

  // 2 Supervisors
  const sup1 = await prisma.user.create({
    data: { email: 'sup1@fieldops.com', passwordHash: 'hashed_password', role: 'SUPERVISOR' },
  });
  const sup2 = await prisma.user.create({
    data: { email: 'sup2@fieldops.com', passwordHash: 'hashed_password', role: 'SUPERVISOR' },
  });

  // 10 Employees
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

  const employeesData = [];
  for (const empData of realEmployees) {
    const user = await prisma.user.create({
      data: { email: empData.email, passwordHash: 'hashed_password', role: 'EMPLOYEE' },
    });
    
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: empData.code,
        firstName: empData.firstName,
        lastName: empData.lastName,
      }
    });
    employeesData.push(emp);
  }

  // --- Sites ---
  const siteNames = [
    { name: 'Golden Gate Bridge Rehab', code: 'SIT-001', proj: 'PROJ-1' },
    { name: 'Empire State Retrofit', code: 'SIT-002', proj: 'PROJ-2' },
    { name: 'Brooklyn Navy Yard', code: 'SIT-003', proj: 'PROJ-3' },
    { name: 'Manhattan Highrise Hub', code: 'SIT-004', proj: 'PROJ-4' },
    { name: 'Queens Subway Upgrade', code: 'SIT-005', proj: 'PROJ-5' },
  ];
  const sitesData = [];
  for (let i = 0; i < siteNames.length; i++) {
    const s = siteNames[i];
    const idx = i + 1;
    const site = await prisma.site.create({
      data: {
        name: s.name,
        projectId: s.proj,
        latitude: 8.5241 + (idx * 0.01),
        longitude: 76.9366 + (idx * 0.01),
        siteCode: s.code,
      }
    });
    sitesData.push(site);
  }

  // --- Sample Attendance & Site Punches (for Emp 1) ---
  const emp1 = employeesData[0];
  const siteA = sitesData[0];

  await prisma.attendanceEvent.create({
    data: {
      employeeId: emp1.id,
      checkIn: new Date(new Date().setHours(9, 0, 0, 0)),
      checkOut: new Date(new Date().setHours(17, 30, 0, 0)),
      status: 'Present',
    }
  });

  await prisma.sitePunch.create({
    data: {
      clientPunchId: uuidv4(),
      employeeId: emp1.id,
      siteId: siteA.id,
      punchType: 'IN',
      latitude: siteA.latitude,
      longitude: siteA.longitude,
    }
  });

  // --- Sample Expenses ---
  const receiptDate = new Date('2023-10-26T12:44:00Z');

  // Matched Expense
  const expMatched = await prisma.expense.create({
    data: {
      expenseCode: 'EXP-1001',
      employeeId: emp1.id,
      siteId: siteA.id,
      category: 'Materials',
      billAmount: 178.74,
      paymentAmount: 178.74,
      matchStatus: 'AMOUNT_MATCHED',
      approvalStatus: 'PENDING_APPROVAL',
      description: 'Bought cement',
      createdAt: receiptDate,
    }
  });

  await prisma.expenseDocument.createMany({
    data: [
      { expenseId: expMatched.id, type: 'BILL', url: 's3://mock/bill1.jpg', createdAt: receiptDate },
      { expenseId: expMatched.id, type: 'PROOF', url: 's3://mock/proof1.jpg', createdAt: receiptDate },
    ]
  });

  // Mismatched Expense
  const expMismatch = await prisma.expense.create({
    data: {
      expenseCode: 'EXP-1002',
      employeeId: employeesData[1].id,
      siteId: siteA.id,
      category: 'Travel',
      billAmount: 178.74,
      paymentAmount: 150.00,
      matchStatus: 'AMOUNT_MISMATCH',
      approvalStatus: 'AMOUNT_MISMATCH',
      description: 'Taxi fare',
      createdAt: receiptDate,
    }
  });

  await prisma.expenseDocument.createMany({
    data: [
      { expenseId: expMismatch.id, type: 'BILL', url: 's3://mock/bill2.jpg', createdAt: receiptDate },
      { expenseId: expMismatch.id, type: 'PROOF', url: 's3://mock/proof2.jpg', createdAt: receiptDate },
    ]
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
