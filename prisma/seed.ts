import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

async function main() {
  // Clean tables in order (transactions → accounts → categories → users)
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Reset auto-increment sequences
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE accounts_id_seq RESTART WITH 1`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE categories_id_seq RESTART WITH 1`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE transactions_id_seq RESTART WITH 1`,
  );

  // ---------------------------------------------------------
  // Users (id 1-3)
  // Plaintext passwords for testing:
  //   Alice  → alice123!
  //   Budi   → budi123!
  //   Citra  → citra123!
  // ---------------------------------------------------------
  const alicePassword = await bcrypt.hash('alice123!', SALT_ROUNDS);
  const budiPassword = await bcrypt.hash('budi123!', SALT_ROUNDS);
  const citraPassword = await bcrypt.hash('citra123!', SALT_ROUNDS);

  await prisma.user.createMany({
    data: [
      {
        name: 'Alice Wirawan',
        email: 'alice@example.com',
        password: alicePassword,
        role: 'user',
        createdAt: new Date('2026-01-05T08:00:00'),
      },
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: budiPassword,
        role: 'user',
        createdAt: new Date('2026-01-06T09:15:00'),
      },
      {
        name: 'Citra Lestari',
        email: 'citra@example.com',
        password: citraPassword,
        role: 'admin',
        createdAt: new Date('2026-01-07T10:30:00'),
      },
    ],
  });

  // ---------------------------------------------------------
  // Accounts (id 1-6) — 2 per user
  // ---------------------------------------------------------
  await prisma.account.createMany({
    data: [
      {
        userId: 1,
        name: 'Alice Cash Wallet',
        type: 'cash',
        balance: 500000.0,
        createdAt: new Date('2026-01-05T08:05:00'),
      },
      {
        userId: 1,
        name: 'Alice BCA Savings',
        type: 'bank',
        balance: 15250000.0,
        createdAt: new Date('2026-01-05T08:06:00'),
      },
      {
        userId: 2,
        name: 'Budi Cash Wallet',
        type: 'cash',
        balance: 300000.0,
        createdAt: new Date('2026-01-06T09:20:00'),
      },
      {
        userId: 2,
        name: 'Budi Mandiri Giro',
        type: 'bank',
        balance: 9800000.0,
        createdAt: new Date('2026-01-06T09:21:00'),
      },
      {
        userId: 3,
        name: 'Citra GoPay',
        type: 'e_wallet',
        balance: 750000.0,
        createdAt: new Date('2026-01-07T10:35:00'),
      },
      {
        userId: 3,
        name: 'Citra BNI Savings',
        type: 'bank',
        balance: 22300000.0,
        createdAt: new Date('2026-01-07T10:36:00'),
      },
    ],
  });

  // ---------------------------------------------------------
  // Categories (id 1-7)
  // ---------------------------------------------------------
  await prisma.category.createMany({
    data: [
      { name: 'Salary', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Investment Return', type: 'income' },
      { name: 'Groceries', type: 'expense' },
      { name: 'Dining Out', type: 'expense' },
      { name: 'Transportation', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
    ],
  });

  // ---------------------------------------------------------
  // Transactions (24 rows)
  // ---------------------------------------------------------
  await prisma.transaction.createMany({
    data: [
      // Alice (accounts 1-2)
      {
        accountId: 2,
        categoryId: 1,
        type: 'income',
        amount: 12000000.0,
        description: 'January salary',
        transactionDate: new Date('2026-01-25'),
        createdAt: new Date('2026-01-25T09:00:00'),
      },
      {
        accountId: 1,
        categoryId: 4,
        type: 'expense',
        amount: 350000.0,
        description: 'Weekly groceries',
        transactionDate: new Date('2026-01-27'),
        createdAt: new Date('2026-01-27T17:30:00'),
      },
      {
        accountId: 1,
        categoryId: 5,
        type: 'expense',
        amount: 120000.0,
        description: 'Dinner with friends',
        transactionDate: new Date('2026-01-28'),
        createdAt: new Date('2026-01-28T20:00:00'),
      },
      {
        accountId: 2,
        categoryId: 6,
        type: 'expense',
        amount: 450000.0,
        description: 'Monthly train pass',
        transactionDate: new Date('2026-02-01'),
        createdAt: new Date('2026-02-01T08:00:00'),
      },
      {
        accountId: 1,
        categoryId: 4,
        type: 'expense',
        amount: 280000.0,
        description: 'Groceries',
        transactionDate: new Date('2026-02-05'),
        createdAt: new Date('2026-02-05T18:00:00'),
      },
      {
        accountId: 2,
        categoryId: 2,
        type: 'income',
        amount: 2500000.0,
        description: 'Freelance design project',
        transactionDate: new Date('2026-02-10'),
        createdAt: new Date('2026-02-10T14:00:00'),
      },
      {
        accountId: 2,
        categoryId: 1,
        type: 'income',
        amount: 12000000.0,
        description: 'February salary',
        transactionDate: new Date('2026-02-25'),
        createdAt: new Date('2026-02-25T09:00:00'),
      },
      {
        accountId: 1,
        categoryId: 5,
        type: 'expense',
        amount: 200000.0,
        description: 'Coffee shop work session',
        transactionDate: new Date('2026-02-26'),
        createdAt: new Date('2026-02-26T11:00:00'),
      },
      {
        accountId: 2,
        categoryId: 6,
        type: 'expense',
        amount: 150000.0,
        description: 'Ride-hailing to airport',
        transactionDate: new Date('2026-03-02'),
        createdAt: new Date('2026-03-02T06:00:00'),
      },
      {
        accountId: 1,
        categoryId: 4,
        type: 'expense',
        amount: 310000.0,
        description: 'Groceries',
        transactionDate: new Date('2026-03-08'),
        createdAt: new Date('2026-03-08T19:00:00'),
      },
      // Budi (accounts 3-4)
      {
        accountId: 4,
        categoryId: 1,
        type: 'income',
        amount: 9500000.0,
        description: 'January salary',
        transactionDate: new Date('2026-01-25'),
        createdAt: new Date('2026-01-25T09:10:00'),
      },
      {
        accountId: 3,
        categoryId: 4,
        type: 'expense',
        amount: 220000.0,
        description: 'Groceries',
        transactionDate: new Date('2026-01-29'),
        createdAt: new Date('2026-01-29T17:00:00'),
      },
      {
        accountId: 3,
        categoryId: 6,
        type: 'expense',
        amount: 80000.0,
        description: 'Motorbike fuel',
        transactionDate: new Date('2026-01-30'),
        createdAt: new Date('2026-01-30T07:00:00'),
      },
      {
        accountId: 4,
        categoryId: 3,
        type: 'income',
        amount: 600000.0,
        description: 'Mutual fund dividend',
        transactionDate: new Date('2026-02-03'),
        createdAt: new Date('2026-02-03T10:00:00'),
      },
      {
        accountId: 3,
        categoryId: 5,
        type: 'expense',
        amount: 175000.0,
        description: 'Lunch out',
        transactionDate: new Date('2026-02-07'),
        createdAt: new Date('2026-02-07T12:30:00'),
      },
      {
        accountId: 4,
        categoryId: 1,
        type: 'income',
        amount: 9500000.0,
        description: 'February salary',
        transactionDate: new Date('2026-02-25'),
        createdAt: new Date('2026-02-25T09:10:00'),
      },
      {
        accountId: 3,
        categoryId: 4,
        type: 'expense',
        amount: 260000.0,
        description: 'Groceries',
        transactionDate: new Date('2026-02-27'),
        createdAt: new Date('2026-02-27T18:15:00'),
      },
      {
        accountId: 3,
        categoryId: 6,
        type: 'expense',
        amount: 90000.0,
        description: 'Motorbike fuel',
        transactionDate: new Date('2026-03-01'),
        createdAt: new Date('2026-03-01T07:00:00'),
      },
      {
        accountId: 4,
        categoryId: 2,
        type: 'income',
        amount: 1800000.0,
        description: 'Freelance copywriting',
        transactionDate: new Date('2026-03-05'),
        createdAt: new Date('2026-03-05T15:00:00'),
      },
      // Citra (accounts 5-6)
      {
        accountId: 6,
        categoryId: 1,
        type: 'income',
        amount: 18000000.0,
        description: 'January salary',
        transactionDate: new Date('2026-01-25'),
        createdAt: new Date('2026-01-25T09:20:00'),
      },
      {
        accountId: 5,
        categoryId: 5,
        type: 'expense',
        amount: 300000.0,
        description: 'Team dinner',
        transactionDate: new Date('2026-01-31'),
        createdAt: new Date('2026-01-31T20:30:00'),
      },
      {
        accountId: 5,
        categoryId: 4,
        type: 'expense',
        amount: 400000.0,
        description: 'Groceries',
        transactionDate: new Date('2026-02-06'),
        createdAt: new Date('2026-02-06T17:45:00'),
      },
      {
        accountId: 6,
        categoryId: 1,
        type: 'income',
        amount: 18000000.0,
        description: 'February salary',
        transactionDate: new Date('2026-02-25'),
        createdAt: new Date('2026-02-25T09:20:00'),
      },
      {
        accountId: 5,
        categoryId: 6,
        type: 'expense',
        amount: 130000.0,
        description: 'Ride-hailing',
        transactionDate: new Date('2026-03-03'),
        createdAt: new Date('2026-03-03T09:00:00'),
      },
    ],
  });

  console.log('Seed completed successfully');
  console.log('  - 3 users');
  console.log('  - 6 accounts');
  console.log('  - 7 categories');
  console.log('  - 24 transactions');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
