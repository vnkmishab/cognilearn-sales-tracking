'use client';

import { useState } from 'react';

interface AttendanceRecord {
  id: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  employeeId: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
}

interface AttendanceListClientProps {
  initialAttendance: AttendanceRecord[];
}

export default function AttendanceListClient({ initialAttendance }: AttendanceListClientProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Extract unique employees who have records
  const uniqueEmployees = Array.from(
    new Map(
      initialAttendance
        .filter((r) => r.employee)
        .map((r) => [r.employee!.employeeCode, r.employee!])
    ).values()
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Apply filters
  const filteredRecords = initialAttendance.filter((record) => {
    // Employee Filter
    if (selectedEmployee !== 'ALL' && record.employee?.employeeCode !== selectedEmployee) {
      return false;
    }

    const date = new Date(record.checkIn);

    // Year Filter
    if (selectedYear !== 'ALL' && date.getFullYear().toString() !== selectedYear) {
      return false;
    }

    // Month Filter
    if (selectedMonth !== 'ALL' && monthsList[date.getMonth()] !== selectedMonth) {
      return false;
    }

    return true;
  });

  // Handle Export CSV
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('No attendance records found for the selected filters.');
      return;
    }

    let csvContent = 'ATTENDANCE REPORT\n\n';
    const headers = ['Employee Name', 'Employee Code', 'Date', 'Check-In Time', 'Check-Out Time', 'Status', 'Total Hours'];
    csvContent += headers.join(',') + '\n';

    filteredRecords.forEach((record) => {
      const checkInDate = new Date(record.checkIn);
      const empName = record.employee ? `"${record.employee.firstName} ${record.employee.lastName}"` : 'N/A';
      const empCode = record.employee?.employeeCode || 'N/A';
      const dateStr = checkInDate.toLocaleDateString();
      const checkInStr = checkInDate.toLocaleTimeString();
      let checkOutStr = '--';
      let hoursStr = '--';

      if (record.checkOut) {
        const checkOutDate = new Date(record.checkOut);
        checkOutStr = checkOutDate.toLocaleTimeString();
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        hoursStr = (diffMs / (1000 * 60 * 60)).toFixed(2);
      }

      const row = [empName, empCode, dateStr, checkInStr, checkOutStr, record.status, hoursStr];
      csvContent += row.map((field) => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-3">
          Attendance Tracking
          <span className="text-sm font-medium bg-zinc-800/80 text-amber-500 px-3 py-1 rounded-full border border-zinc-700/50">
            Filtered: {filteredRecords.length}
          </span>
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Dropdown Filter */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-350 outline-none focus:border-amber-500/50 hover:border-zinc-700 transition-all cursor-pointer font-medium"
          >
            <option value="ALL">All Employees</option>
            {uniqueEmployees.map((emp) => (
              <option key={emp.employeeCode} value={emp.employeeCode}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>

          {/* Year Dropdown Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-350 outline-none focus:border-amber-500/50 hover:border-zinc-700 transition-all cursor-pointer font-medium"
          >
            <option value="ALL">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month Dropdown Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-350 outline-none focus:border-amber-500/50 hover:border-zinc-700 transition-all cursor-pointer font-medium"
          >
            <option value="ALL">All Months</option>
            {monthsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExport}
            className="group relative overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 px-4 py-2 rounded-xl shadow-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="relative z-10">Export Report</span>
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-zinc-300">
                      {record.employee?.firstName} {record.employee?.lastName}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
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
                <td colSpan={4} className="p-8 text-center text-zinc-650 text-sm">
                  No attendance records matched the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
