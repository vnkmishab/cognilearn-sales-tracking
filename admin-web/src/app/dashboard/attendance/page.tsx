import { fetchAttendance } from '@/lib/api';
import AttendanceListClient from './AttendanceListClient';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  let attendance: any[] = [];
  try {
    attendance = await fetchAttendance();
  } catch (e) {
    console.warn('Backend not running yet, using empty attendance list');
  }

  return (
    <AttendanceListClient initialAttendance={attendance} />
  );
}
