'use client';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  user?: {
    email: string;
  } | null;
}

interface EmployeeDetailsModalProps {
  employee: Employee;
  attendance: any[];
  expenses: any[];
  sitePunches: any[];
  onClose: () => void;
}

export default function EmployeeDetailsModal({
  employee,
  attendance,
  expenses,
  sitePunches,
  onClose,
}: EmployeeDetailsModalProps) {
  
  const myAttendance = attendance
    .filter((a) => a.employeeId === employee.id || a.employee?.id === employee.id)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  const myExpenses = expenses
    .filter((e) => e.employeeId === employee.id || e.employee?.id === employee.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const myPunches = sitePunches
    .filter((p) => p.employeeId === employee.id || p.employee?.id === employee.id)
    .sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center rounded-t-2xl shrink-0">
          <div>
            <h3 className="text-2xl font-semibold text-zinc-100 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {employee.firstName} {employee.lastName}
            </h3>
            <div className="flex gap-4 items-center mt-2 text-sm text-zinc-400">
              <span className="font-mono text-amber-500">{employee.employeeCode}</span>
              <span>{employee.user?.email || 'No email provided'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-2 hover:bg-zinc-800 rounded-lg transition-colors outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Attendance Section */}
          <section>
            <h4 className="text-lg font-medium text-zinc-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Recent Attendance
            </h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date / Time In</th>
                    <th className="px-4 py-3 font-semibold">Time Out</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {myAttendance.length > 0 ? (
                    myAttendance.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {new Date(a.checkIn).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400">
                          {a.checkOut ? new Date(a.checkOut).toLocaleString() : '--'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                            a.status === 'Present' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Punch History Section */}
          <section>
            <h4 className="text-lg font-medium text-zinc-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Recent Punches
            </h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {myPunches.length > 0 ? (
                    myPunches.slice(0, 10).map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {new Date(p.syncedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-zinc-200">{p.punchType}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {p.site?.name || 'Unknown Site'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">No punch records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expenses Section */}
          <section>
            <h4 className="text-lg font-medium text-zinc-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Recent Expenses
            </h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {myExpenses.length > 0 ? (
                    myExpenses.slice(0, 10).map((e) => (
                      <tr key={e.id} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-200">
                          ${e.billAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 capitalize">
                          {e.category.toLowerCase().replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                            e.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : e.approvalStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {e.approvalStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">No expense records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
