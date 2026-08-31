import { fetchAllSites, fetchEmployees, fetchAttendance, fetchExpenses, fetchSitePunches } from '@/lib/api';
import DashboardSitesClient from './DashboardSitesClient';
import DashboardEmployeesClient from './DashboardEmployeesClient';
import PowerBiExportClient from './PowerBiExportClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let sites = [];
  let employees = [];
  let attendance = [];
  let expenses = [];
  let sitePunches = [];
  
  try {
    [sites, employees, attendance, expenses, sitePunches] = await Promise.all([
      fetchAllSites(),
      fetchEmployees(),
      fetchAttendance(),
      fetchExpenses(),
      fetchSitePunches()
    ]);
  } catch (e) {
    console.warn('Backend offline, using empty lists');
  }

  const todayStr = new Date().toDateString();
  const stats = {
    employees: employees.length,
    presentToday: attendance.filter((r: any) => new Date(r.checkIn).toDateString() === todayStr && r.status === 'Present').length,
    pendingExpenses: expenses.filter((e: any) => e.approvalStatus === 'PENDING' || e.approvalStatus === 'PENDING_APPROVAL').length,
    offlinePunchesPending: 0
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
          Dashboard <span className="font-medium text-amber-500">Overview</span>
        </h1>
        <PowerBiExportClient 
          employees={employees} 
          attendance={attendance} 
          expenses={expenses} 
          sitePunches={sitePunches} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Employees</div>
          <div className="text-4xl font-light text-zinc-100">{stats.employees}</div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Present Today</div>
          <div className="text-4xl font-light text-emerald-400">{stats.presentToday}</div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Pending Expenses</div>
          <div className="text-4xl font-light text-amber-500">{stats.pendingExpenses}</div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Offline Punches Pending</div>
          <div className="text-4xl font-light text-blue-400">{stats.offlinePunchesPending}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSitesClient initialSites={sites} />

        <DashboardEmployeesClient 
          initialEmployees={employees} 
          attendance={attendance}
          expenses={expenses}
          sitePunches={sitePunches}
          activeEmployeeIds={attendance
            .filter((r: any) => new Date(r.checkIn).toDateString() === todayStr && r.status === 'Present')
            .map((r: any) => r.employee?.id || r.employeeId)}
        />
      </div>
    </div>
  );
}
