'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface PowerBiExportClientProps {
  employees: any[];
  attendance: any[];
  expenses: any[];
  sitePunches: any[];
}

export default function PowerBiExportClient({ employees, attendance, expenses, sitePunches }: PowerBiExportClientProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();

      // 1. Employees.csv
      const employeesHeaders = ['ID', 'FirstName', 'LastName', 'Email', 'EmployeeCode', 'Role', 'Status', 'CreatedAt'];
      let employeesCsv = employeesHeaders.join(',') + '\n';
      employees.forEach(e => {
        employeesCsv += [
          e.id, e.firstName, e.lastName, e.email, e.employeeCode, e.role, e.status, e.createdAt
        ].map(v => `"${v || ''}"`).join(',') + '\n';
      });
      zip.file('Employees.csv', employeesCsv);

      // 2. Attendance.csv
      const attendanceHeaders = ['ID', 'EmployeeID', 'Date', 'Status', 'CheckInTime', 'CheckOutTime', 'CreatedAt'];
      let attendanceCsv = attendanceHeaders.join(',') + '\n';
      attendance.forEach(a => {
        const empId = a.employee?.id || a.employeeId || '';
        attendanceCsv += [
          a.id, empId, new Date(a.checkIn).toLocaleDateString(), a.status, a.checkIn, a.checkOut || '', a.createdAt
        ].map(v => `"${v || ''}"`).join(',') + '\n';
      });
      zip.file('Attendance.csv', attendanceCsv);

      // 3. Expenses.csv
      const expensesHeaders = ['ID', 'EmployeeID', 'SiteID', 'ExpenseCode', 'Category', 'BillAmount', 'PaymentAmount', 'ApprovalStatus', 'MatchStatus', 'CreatedAt'];
      let expensesCsv = expensesHeaders.join(',') + '\n';
      expenses.forEach(ex => {
        const empId = ex.employee?.id || ex.employeeId || '';
        const siteId = ex.site?.id || ex.siteId || '';
        expensesCsv += [
          ex.id, empId, siteId, ex.expenseCode, ex.category, ex.billAmount, ex.paymentAmount || '', ex.approvalStatus, ex.matchStatus || '', ex.createdAt
        ].map(v => `"${v !== null && v !== undefined ? v : ''}"`).join(',') + '\n';
      });
      zip.file('Expenses.csv', expensesCsv);

      // 4. SitePunches.csv
      const punchesHeaders = ['ID', 'EmployeeID', 'SiteID', 'PunchInTime', 'PunchOutTime', 'Latitude', 'Longitude', 'CreatedAt'];
      let punchesCsv = punchesHeaders.join(',') + '\n';
      sitePunches.forEach(p => {
        const empId = p.employee?.id || p.employeeId || '';
        const siteId = p.site?.id || p.siteId || '';
        punchesCsv += [
          p.id, empId, siteId, p.punchIn, p.punchOut || '', p.latitude || '', p.longitude || '', p.createdAt
        ].map(v => `"${v !== null && v !== undefined ? v : ''}"`).join(',') + '\n';
      });
      zip.file('SitePunches.csv', punchesCsv);

      // Generate ZIP and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `PowerBI_Dataset_${new Date().toISOString().split('T')[0]}.zip`);

    } catch (err) {
      console.error('Error generating Power BI export', err);
      alert('Failed to generate export dataset.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="group relative overflow-hidden bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 hover:from-yellow-500/20 hover:to-yellow-600/20 border border-yellow-500/30 hover:border-yellow-400 text-yellow-400 px-5 py-2.5 rounded-xl shadow-lg shadow-yellow-500/5 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      {isExporting ? (
        <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M12 18v-6"></path>
          <path d="M9 15l3 3 3-3"></path>
        </svg>
      )}
      <span className="relative z-10">Export for Power BI</span>
    </button>
  );
}
