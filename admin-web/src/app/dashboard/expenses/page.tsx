import { fetchExpenses } from '@/lib/api';
import ExpensesListClient from './ExpensesListClient';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  let expenses: any[] = [];
  try {
    expenses = await fetchExpenses();
  } catch (e) {
    console.warn('Backend not running yet, using empty expenses list');
  }

  return <ExpensesListClient initialExpenses={expenses} />;
}
