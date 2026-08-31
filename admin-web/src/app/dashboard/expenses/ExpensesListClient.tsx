'use client';

import { useState } from 'react';
import { updateExpenseStatus } from '@/lib/api';

interface ExpenseRecord {
  id: string;
  expenseCode: string;
  category: string;
  billAmount: number;
  paymentAmount: number | null;
  matchStatus: string | null;
  approvalStatus: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
  site?: {
    name: string;
    siteCode: string;
  } | null;
  documents?: {
    id: string;
    url: string;
    type: string;
    createdAt: string;
  }[];
}

export default function ExpensesListClient({ initialExpenses }: { initialExpenses: ExpenseRecord[] }) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; code: string; category: string; uploadedAt: string } | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const uniqueEmployees = Array.from(
    new Map(
      expenses
        .filter((e) => e.employee)
        .map((e) => [e.employee!.id, e.employee!])
    ).values()
  );

  const filteredExpenses = expenses.filter(record => {
    if (selectedEmployee !== 'ALL' && record.employee?.id !== selectedEmployee) return false;
    
    const date = new Date(record.createdAt);
    const recordYear = date.getFullYear().toString();
    const recordMonth = date.toLocaleString('default', { month: 'long' });
    
    if (selectedYear !== 'ALL' && recordYear !== selectedYear) return false;
    if (selectedMonth !== 'ALL' && recordMonth !== selectedMonth) return false;
    return true;
  });

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setLoadingId(id);
    try {
      await updateExpenseStatus(id, newStatus);
      setExpenses(prev => 
        prev.map(exp => exp.id === id ? { ...exp, approvalStatus: newStatus } : exp)
      );
    } catch (err) {
      alert('Failed to update expense status. Please check your connection.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownloadExpenses = () => {
    if (filteredExpenses.length === 0) {
      alert('No expense records found for the selected time period.');
      return;
    }

    const reportLabel = selectedYear === 'ALL' && selectedMonth === 'ALL' 
      ? 'ALL_TIME' 
      : `${selectedMonth !== 'ALL' ? selectedMonth : 'ALL_MONTHS'}_${selectedYear !== 'ALL' ? selectedYear : 'ALL_YEARS'}`;

    let csvContent = `EXPENSES REPORT - ${reportLabel.replace(/_/g, ' ')}\n\n`;
    const expensesHeaders = ['Employee Name', 'Employee Code', 'Date', 'Expense Code', 'Category', 'Amount (₹)', 'Site', 'Status'];
    csvContent += expensesHeaders.join(',') + '\n';

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const empName = expense.employee ? `${expense.employee.firstName} ${expense.employee.lastName}` : 'N/A';
      const empCode = expense.employee?.employeeCode || 'N/A';
      const siteName = expense.site ? `${expense.site.name} (${expense.site.siteCode})` : 'N/A';

      const row = [
        empName,
        empCode,
        date.toLocaleDateString(),
        expense.expenseCode,
        expense.category,
        expense.billAmount?.toFixed(2) || '0.00',
        siteName,
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
          Expenses Review
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow shadow-inner cursor-pointer"
            >
              <option value="ALL">All Employees</option>
              {uniqueEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>

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
      </div>
      
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Expense Code</th>
              <th className="p-4 font-semibold">Employee</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Proof</th>
              <th className="p-4 font-semibold">Approval Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => {
                const isMismatch = expense.paymentAmount !== null && 
                                   expense.paymentAmount !== undefined && 
                                   expense.paymentAmount !== expense.billAmount;

                const isPending = expense.approvalStatus !== 'APPROVED' && 
                                  expense.approvalStatus !== 'REJECTED';

                return (
                  <tr key={expense.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-zinc-300">{expense.expenseCode}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1 leading-none">
                        {new Date(expense.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400">
                      {expense.employee?.firstName} {expense.employee?.lastName}
                    </td>
                    <td className="p-4 text-zinc-400">{expense.category}</td>
                    <td className="p-4 font-mono">
                      {isMismatch ? (
                        <div className="space-y-1">
                          <div className="text-amber-500 font-semibold">Claimed: ₹{expense.paymentAmount?.toFixed(2)}</div>
                          <div className="text-xs text-zinc-400">Bill: ₹{expense.billAmount?.toFixed(2)}</div>
                          <span className="inline-block text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider">
                            Mismatch
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-zinc-200">
                          ₹{expense.billAmount?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {expense.documents && expense.documents.length > 0 ? (
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              const rawUrl = expense.documents[0].url;
                              const url = rawUrl.startsWith('s3://')
                                ? 'http://localhost:3000/uploads/mock-receipt.jpg'
                                : rawUrl.startsWith('/')
                                ? `http://localhost:3000${rawUrl}`
                                : rawUrl.replace('127.0.0.1:3000', 'localhost:3000');
                              setSelectedReceipt({
                                url,
                                code: expense.expenseCode,
                                category: expense.category,
                                uploadedAt: expense.documents[0].createdAt
                              });
                            }}
                            className="text-amber-500 hover:text-amber-400 hover:underline font-medium text-sm text-left block"
                          >
                            View Receipt
                          </button>
                          <div className="text-[10px] text-zinc-500 font-mono leading-none">
                            {new Date(expense.documents[0].createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-w-[220px]">
                          <div className="space-y-1">
                            <div className="text-red-400/90 font-medium text-xs flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              No Proof Uploaded
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono leading-none">
                              {new Date(expense.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-relaxed font-light">
                            <span className="text-zinc-300 font-medium">Purpose:</span> {expense.category} expense
                            {expense.description ? (
                              <>
                                <br />
                                <span className="text-zinc-300 font-medium">Details:</span> {expense.description}
                              </>
                            ) : (
                              <>
                                <br />
                                <span className="text-zinc-500 italic">No additional details provided.</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                          expense.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          expense.approvalStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          isMismatch ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {expense.approvalStatus || 'DRAFT'}
                        </span>
                        
                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={loadingId === expense.id}
                              onClick={() => handleUpdateStatus(expense.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={loadingId === expense.id}
                              onClick={() => handleUpdateStatus(expense.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-zinc-100 font-bold text-xs rounded transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-600 text-sm">
                  No expenses found or backend is offline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedReceipt(null)}
        >
          <div 
            className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
          >
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors z-10 bg-zinc-900/80 p-2 rounded-full backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4 pr-12">
              <h2 className="text-xl font-light text-zinc-100 flex items-center gap-2 mb-1">
                Receipt: <span className="font-semibold text-amber-500">{selectedReceipt.code}</span>
                <span className="text-xs bg-zinc-850 px-2 py-1 rounded text-zinc-400">{selectedReceipt.category}</span>
              </h2>
              <div className="text-xs text-zinc-500 font-mono">
                Uploaded At: {new Date(selectedReceipt.uploadedAt).toLocaleString()}
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-zinc-900 bg-zinc-900/30 flex items-center justify-center p-2 min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceipt.url}
                alt={`Receipt for ${selectedReceipt.code}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold rounded-xl shadow-lg shadow-amber-500/10 transition-all text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
