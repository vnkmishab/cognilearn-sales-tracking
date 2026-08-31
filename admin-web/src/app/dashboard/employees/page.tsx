import { fetchEmployees } from '@/lib/api';
import EmployeesListClient from './EmployeesListClient';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  let employees: any[] = [];
  try {
    employees = await fetchEmployees();
  } catch (e) {
    console.warn('Backend not running yet, using empty employees list');
  }

  return <EmployeesListClient initialEmployees={employees} />;
}
