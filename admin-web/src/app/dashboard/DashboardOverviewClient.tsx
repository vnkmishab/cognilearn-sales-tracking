'use client';

import { useState } from 'react';
import DownloadAttendanceReport from './attendance/DownloadAttendanceReport';
import AddSiteModal from '@/components/AddSiteModal';

interface DashboardOverviewClientProps {
  stats: {
    employees: number;
    presentToday: number;
    pendingExpenses: number;
    offlinePunchesPending: number;
  };
  sites: any[];
  attendance: any[];
  employees: any[];
  sitePunches: any[];
}

export default function DashboardOverviewClient({
  stats,
  sites,
  attendance,
  employees,
  sitePunches,
}: DashboardOverviewClientProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [sitesList, setSitesList] = useState(sites);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  // Filter attendance records
  const filteredAttendance = attendance.filter((record) => {
    if (selectedEmployeeId === 'ALL') return true;
    return record.employee?.id === selectedEmployeeId;
  });

  // Filter sites visited
  const filteredSites = sitesList.filter((site) => {
    if (selectedEmployeeId === 'ALL') return true;
    
    // Check if the selected employee has punched at this site
    return sitePunches.some(
      (punch) => 
        punch.employeeId === selectedEmployeeId && 
        punch.siteId === site.id
    );
  });

  // Find selected employee details
  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);

  // Dynamic Stats Cards
  const isEmployeeFiltered = selectedEmployeeId !== 'ALL';
  const employeeAttendanceToday = isEmployeeFiltered 
    ? attendance.find(
        (r) => 
          r.employee?.id === selectedEmployeeId && 
          new Date(r.checkIn).toDateString() === new Date().toDateString()
      )
    : null;

  const employeePunchesCount = isEmployeeFiltered
    ? sitePunches.filter((p) => p.employeeId === selectedEmployeeId).length
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
            Dashboard <span className="font-medium text-amber-500">Overview</span>
          </h1>
          {isEmployeeFiltered && (
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Viewing insights for: <span className="text-amber-500 font-semibold">{selectedEmployee?.firstName} {selectedEmployee?.lastName} ({selectedEmployee?.employeeCode})</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Select Employee:
          </label>
          <select 
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow shadow-inner cursor-pointer"
          >
            <option value="ALL">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!isEmployeeFiltered ? (
          <>
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
          </>
        ) : (
          <>
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Employee Code</div>
              <div className="text-4xl font-light text-zinc-100">{selectedEmployee?.employeeCode}</div>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Status Today</div>
              <div className={`text-4xl font-light ${employeeAttendanceToday ? 'text-emerald-400' : 'text-red-400'}`}>
                {employeeAttendanceToday ? 'Present' : 'Absent'}
              </div>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Site Visits (Total)</div>
              <div className="text-4xl font-light text-amber-500">{filteredSites.length}</div>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Total Punch Events</div>
              <div className="text-4xl font-light text-blue-400">{employeePunchesCount}</div>
            </div>
          </>
        )}
      </div>

      {/* Side by side grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sites Section */}
        <div className="bg-zinc-900/20 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-zinc-100 tracking-tight flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {isEmployeeFiltered ? 'Visited' : 'Construction'} <span className="font-semibold text-amber-500">Sites</span>
            </h2>
            {!isEmployeeFiltered && (
              <button 
                onClick={() => setIsAddSiteModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-xs"
              >
                Add Site
              </button>
            )}
          </div>
          
          <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/50 overflow-hidden flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Site Name</th>
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Project ID</th>
                  <th className="p-4 font-semibold">Coordinates</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.length > 0 ? (
                  filteredSites.map((site: any) => (
                    <tr key={site.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4 font-medium text-zinc-300">{site.name}</td>
                      <td className="p-4 text-zinc-400">{site.siteCode}</td>
                      <td className="p-4 text-zinc-500">{site.projectId || 'N/A'}</td>
                      <td className="p-4 text-xs text-zinc-500 font-mono">
                        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                      </td>
                      <td className="p-4">
                        {site.isActive ? (
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border bg-zinc-800/50 text-zinc-400 border-zinc-700/50">
                            INACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-600 text-sm">
                      {isEmployeeFiltered 
                        ? 'No site visits recorded for this employee.' 
                        : 'No sites found or backend is offline.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="bg-zinc-900/20 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-zinc-100 tracking-tight flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Attendance <span className="font-semibold text-amber-500">Tracking</span>
            </h2>
            <DownloadAttendanceReport attendance={filteredAttendance} />
          </div>
          
          <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/50 overflow-hidden flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Check-In</th>
                  <th className="p-4 font-semibold">Check-Out</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record: any) => (
                    <tr key={record.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-zinc-300">
                          {record.employee?.firstName} {record.employee?.lastName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {record.employee?.employeeCode}
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">
                        {new Date(record.checkIn).toLocaleString()}
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">
                        {record.checkOut ? new Date(record.checkOut).toLocaleString() : '--'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                          record.status === 'Present' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-600 text-sm">
                      {isEmployeeFiltered 
                        ? 'No attendance tracking records found for this employee.' 
                        : 'No attendance records found or backend is offline.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddSiteModal 
        isOpen={isAddSiteModalOpen} 
        onClose={() => setIsAddSiteModalOpen(false)} 
        onSiteCreated={(newSite) => setSitesList(prev => [newSite, ...prev])} 
      />
    </div>
  );
}
