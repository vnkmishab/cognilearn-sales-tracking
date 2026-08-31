'use client';

import { useState, useMemo } from 'react';

interface AttendanceRecord {
  id: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
}

interface ExpenseRecord {
  id: string;
  expenseCode: string;
  category: string;
  billAmount: number;
  approvalStatus: string;
  createdAt: string;
}

export default function DownloadCombinedReport({ attendance, expenses }: { attendance: AttendanceRecord[], expenses: ExpenseRecord[] }) {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDownloadAttendance = () => {
    const filteredAttendance = attendance.filter(record => {
      if (selectedYear === 'ALL' && selectedMonth === 'ALL') return true;
      const date = new Date(record.checkIn);
      const recordYear = date.getFullYear().toString();
      const recordMonth = date.toLocaleString('default', { month: 'long' });
      
      if (selectedYear !== 'ALL' && recordYear !== selectedYear) return false;
      if (selectedMonth !== 'ALL' && recordMonth !== selectedMonth) return false;
      return true;
    });

    if (filteredAttendance.length === 0) {
      alert('No attendance records found for the selected time period.');
      return;
    }

    const reportLabel = selectedYear === 'ALL' && selectedMonth === 'ALL' 
      ? 'ALL_TIME' 
      : `${selectedMonth !== 'ALL' ? selectedMonth : 'ALL_MONTHS'}_${selectedYear !== 'ALL' ? selectedYear : 'ALL_YEARS'}`;

    let csvContent = `ATTENDANCE REPORT - ${reportLabel.replace(/_/g, ' ')}\n\n`;
    const attendanceHeaders = ['Date', 'Check-In Time', 'Check-Out Time', 'Status', 'Total Hours'];
    csvContent += attendanceHeaders.join(',') + '\n';
    
    filteredAttendance.forEach(record => {
      const checkInDate = new Date(record.checkIn);
      let checkOutStr = '--';
      let hoursStr = '--';

      if (record.checkOut) {
        const checkOutDate = new Date(record.checkOut);
        checkOutStr = checkOutDate.toLocaleTimeString();
        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        hoursStr = (diffMs / (1000 * 60 * 60)).toFixed(2);
      }

      const row = [
        checkInDate.toLocaleDateString(),
        checkInDate.toLocaleTimeString(),
        checkOutStr,
        record.status,
        hoursStr
      ].map(field => `"${field}"`).join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${reportLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExpenses = () => {
    const filteredExpenses = expenses.filter(record => {
      if (selectedYear === 'ALL' && selectedMonth === 'ALL') return true;
      const date = new Date(record.createdAt);
      const recordYear = date.getFullYear().toString();
      const recordMonth = date.toLocaleString('default', { month: 'long' });
      
      if (selectedYear !== 'ALL' && recordYear !== selectedYear) return false;
      if (selectedMonth !== 'ALL' && recordMonth !== selectedMonth) return false;
      return true;
    });

    if (filteredExpenses.length === 0) {
      alert('No expense records found for the selected time period.');
      return;
    }

    const reportLabel = selectedYear === 'ALL' && selectedMonth === 'ALL' 
      ? 'ALL_TIME' 
      : `${selectedMonth !== 'ALL' ? selectedMonth : 'ALL_MONTHS'}_${selectedYear !== 'ALL' ? selectedYear : 'ALL_YEARS'}`;

    let csvContent = `EXPENSES REPORT - ${reportLabel.replace(/_/g, ' ')}\n\n`;
    const expensesHeaders = ['Date', 'Expense Code', 'Category', 'Amount (₹)', 'Status'];
    csvContent += expensesHeaders.join(',') + '\n';

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const row = [
        date.toLocaleDateString(),
        expense.expenseCode,
        expense.category,
        expense.billAmount?.toFixed(2) || '0.00',
        expense.approvalStatus || 'DRAFT'
      ].map(field => `"${field}"`).join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_report_${reportLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow shadow-inner cursor-pointer"
        >
          <option value="ALL">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow shadow-inner cursor-pointer"
        >
          <option value="ALL">All Months</option>
          {monthsList.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleDownloadAttendance}
        className="group relative overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="relative z-10">Attendance Report</span>
      </button>

      <button 
        onClick={handleDownloadExpenses}
        className="group relative overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="relative z-10">Expense Report</span>
      </button>
    </div>
  );
}
