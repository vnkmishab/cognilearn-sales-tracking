'use client';

import { useState, useMemo } from 'react';
import EmployeeDetailsModal from './employees/EmployeeDetailsModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  user?: {
    email: string;
  } | null;
}

interface DashboardEmployeesClientProps {
  initialEmployees: Employee[];
  attendance?: any[];
  expenses?: any[];
  sitePunches?: any[];
  activeEmployeeIds?: string[];
}

export default function DashboardEmployeesClient({ 
  initialEmployees, 
  attendance = [],
  expenses = [],
  sitePunches = [],
  activeEmployeeIds = [] 
}: DashboardEmployeesClientProps) {
  const [detailsEmployee, setDetailsEmployee] = useState<Employee | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE'>('ALL');

  const displayedEmployees = useMemo(() => {
    if (filter === 'ACTIVE') {
      return initialEmployees.filter((emp) => activeEmployeeIds.includes(emp.id));
    }
    return initialEmployees;
  }, [initialEmployees, activeEmployeeIds, filter]);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Employees
        </h2>
        <div className="flex bg-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === 'ALL' 
                ? 'bg-zinc-700 text-zinc-100 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === 'ACTIVE' 
                ? 'bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/20' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active
          </button>
        </div>
      </div>
      
      {displayedEmployees.length > 0 ? (
        <div className="space-y-2 overflow-y-auto overflow-x-hidden max-h-[320px] flex-1 pr-1 custom-scrollbar">
          {displayedEmployees.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => setDetailsEmployee(emp)}
              className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-zinc-800/30 rounded-lg p-2 transition-colors"
            >
              <div>
                <span className="font-semibold text-zinc-200 block">{emp.firstName} {emp.lastName}</span>
                <span className="text-xs text-zinc-500 font-mono">{emp.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-zinc-850 border border-zinc-700/50 text-amber-500 rounded-full">
                  {emp.employeeCode}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-500 text-sm flex-1 flex flex-col items-center justify-center">
          {filter === 'ACTIVE' ? 'No active employees checked in today.' : 'No employees found or backend is offline.'}
        </div>
      )}

      {detailsEmployee && (
        <EmployeeDetailsModal
          employee={detailsEmployee}
          attendance={attendance}
          expenses={expenses}
          sitePunches={sitePunches}
          onClose={() => setDetailsEmployee(null)}
        />
      )}
    </div>
  );
}
