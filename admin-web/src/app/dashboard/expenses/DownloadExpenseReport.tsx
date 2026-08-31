'use client';

import { useState } from 'react';

interface ExpenseRecord {
  id: string;
  expenseCode: string;
  category: string;
  billAmount: number;
  approvalStatus: string;
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
  site?: {
    name: string;
    siteCode: string;
  } | null;
}

export default function DownloadExpenseReport({ expenses }: { expenses: ExpenseRecord[] }) {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

    const hasEmployeeInfo = filteredExpenses.some(record => record.employee);

    const reportLabel = selectedYear === 'ALL' && selectedMonth === 'ALL' 
      ? 'ALL_TIME' 
      : `${selectedMonth !== 'ALL' ? selectedMonth : 'ALL_MONTHS'}_${selectedYear !== 'ALL' ? selectedYear : 'ALL_YEARS'}`;

    let csvContent = `EXPENSES REPORT - ${reportLabel.replace(/_/g, ' ')}\n\n`;
    const expensesHeaders = [];
    if (hasEmployeeInfo) {
      expensesHeaders.push('Employee Name', 'Employee Code');
    }
    expensesHeaders.push('Date', 'Expense Code', 'Category', 'Amount (₹)', 'Site', 'Status');
    csvContent += expensesHeaders.join(',') + '\n';

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const siteName = expense.site ? `${expense.site.name} (${expense.site.siteCode})` : 'N/A';

      const rowData = [];
      if (hasEmployeeInfo) {
        const empName = expense.employee ? `${expense.employee.firstName} ${expense.employee.lastName}` : 'N/A';
        const empCode = expense.employee?.employeeCode || 'N/A';
        rowData.push(empName, empCode);
      }
      rowData.push(
        date.toLocaleDateString(),
        expense.expenseCode,
        expense.category,
        expense.billAmount?.toFixed(2) || '0.00',
        siteName,
        expense.approvalStatus || 'DRAFT'
      );

      const row = rowData.map(field => `"${field}"`).join(',');
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

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="group relative overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="relative z-10">Expense Report</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Export Expense Report</h3>
            <p className="text-xs text-zinc-400 mb-6">Select the month and year to filter the downloaded CSV report.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="ALL">All Years</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Month</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="ALL">All Months</option>
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDownloadExpenses();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
