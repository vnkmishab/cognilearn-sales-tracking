import { fetchMyProfile, fetchMyStatus, fetchMyAttendance, fetchMyExpenses } from '@/lib/api-server';
import Link from 'next/link';
import SitePunchForm from './SitePunchForm';
import PunchAction from './PunchAction';
import DownloadAttendanceReport from '../dashboard/attendance/DownloadAttendanceReport';
import EmployeeNotificationsTray from './EmployeeNotificationsTray';
import DownloadExpenseReport from '../dashboard/expenses/DownloadExpenseReport';
import EmployeeExpensesClient from './EmployeeExpensesClient';

export default async function EmployeeDashboardPage() {
  let profile;
  let status: any = { isCheckedIn: false, hoursThisWeek: 0 };
  let attendance: any[] = [];
  let expenses: any[] = [];
  try {
    profile = await fetchMyProfile();
    status = await fetchMyStatus();
    attendance = await fetchMyAttendance();
    expenses = await fetchMyExpenses();
  } catch (e) {
    console.warn('Backend not running yet, using empty data');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
          Welcome back, <span className="font-medium text-amber-500">{profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Employee'}</span>
        </h1>
      </div>

      <EmployeeNotificationsTray />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Current Status</div>
          {status.isCheckedIn ? (
            <>
              <div className="text-2xl font-semibold text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Checked In
              </div>
              <div className="text-sm text-zinc-500 mt-1 font-mono">
                Since {status.checkInTime ? new Date(status.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown'}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-semibold text-zinc-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
                Checked Out
              </div>
              {status.checkOutTime ? (
                <div className="text-sm text-zinc-400 mt-3 space-y-1 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                  <div className="font-medium text-zinc-500 border-b border-zinc-800/50 pb-1 mb-2 text-xs uppercase tracking-wider">Last Shift</div>
                  <div className="flex justify-between"><span className="text-zinc-500">In:</span> <span className="font-mono">{new Date(status.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Out:</span> <span className="font-mono">{new Date(status.checkOutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></div>
                </div>
              ) : (
                <div className="text-sm text-zinc-500 mt-1">Not active today</div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Hours This Week</div>
          <div className="text-4xl font-light text-zinc-100">{status.hoursThisWeek} <span className="text-xl text-zinc-600">hrs</span></div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Pending Expenses</div>
          <div className="text-4xl font-light text-amber-500">{status.pendingExpenses || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SitePunchForm employeeCode={profile?.employeeCode} initialIsCheckedIn={status.isSiteCheckedIn} initialSiteId={status.activeSiteId} />

        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <h2 className="text-xl font-medium mb-6 text-zinc-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Quick Actions
          </h2>
          <div className="flex flex-col gap-4">
            <PunchAction initialIsCheckedIn={status.isCheckedIn} />
            <Link 
              href="/employee/expenses/new"
              className="group relative overflow-hidden bg-zinc-800 text-zinc-200 border border-zinc-700 px-6 py-4 rounded-xl shadow-lg transition-all text-center block w-full hover:border-amber-500/50 hover:text-amber-400"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="font-medium tracking-wide">Submit Expense</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-Side Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Attendance */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-zinc-100">Recent Attendance</h2>
            <DownloadAttendanceReport attendance={attendance} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">In</th>
                  <th className="pb-3 font-semibold">Out</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 5).map((record) => (
                  <tr key={record.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 font-medium text-zinc-300">{new Date(record.checkIn).toLocaleDateString()}</td>
                    <td className="py-4 text-zinc-400 font-mono">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-4 text-zinc-400 font-mono">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-zinc-600 text-sm">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Expenses */}
        <EmployeeExpensesClient expenses={expenses} />
      </div>
    </div>
  );
}
