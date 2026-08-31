'use client';

import { useState } from 'react';
import Link from 'next/link';
import { removeEmployee } from '@/lib/api';
import AssignSitesModal from './AssignSitesModal';

interface EmployeesListClientProps {
  initialEmployees: any[];
}

export default function EmployeesListClient({ initialEmployees }: EmployeesListClientProps) {
  const [employees, setEmployees] = useState<any[]>(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigningEmployee, setAssigningEmployee] = useState<any | null>(null);

  const openRemoveModal = (emp: any) => {
    setSelectedEmployee(emp);
    setDeletionReason('');
    setError(null);
    setIsModalOpen(true);
  };

  const closeRemoveModal = () => {
    if (isDeleting) return;
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleConfirmRemove = async () => {
    if (!selectedEmployee) return;
    if (!deletionReason.trim()) {
      setError('Please provide a reason for termination.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await removeEmployee(selectedEmployee.id, deletionReason.trim());
      
      // Update local state
      setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (e: any) {
      console.error(e);
      setError('Failed to terminate employee. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Adjust display count to show "30" as requested for demo purposes,
  // or fall back to actual active count if higher than 30.
  const displayTotalCount = Math.max(30, employees.length);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-3">
          Employees
          <span className="text-sm font-medium bg-zinc-800/80 text-amber-500 px-3 py-1 rounded-full border border-zinc-700/50">
            Total: {displayTotalCount}
          </span>
        </h1>
        <Link 
          href="/dashboard/employees/new"
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-sm"
        >
          Add Employee
        </Link>
      </div>
      
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Join Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 font-medium text-zinc-300">{emp.employeeCode}</td>
                  <td className="p-4 text-zinc-400">{emp.firstName} {emp.lastName}</td>
                  <td className="p-4 text-zinc-500">{emp.user?.email || 'N/A'}</td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {emp.user?.role || 'EMPLOYEE'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500">
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setAssigningEmployee(emp)}
                      className="text-amber-500 hover:text-amber-400 font-semibold px-3 py-1 rounded-lg hover:bg-amber-500/10 transition-all text-xs"
                    >
                      Assign Sites
                    </button>
                    <button
                      onClick={() => openRemoveModal(emp)}
                      className="text-red-500 hover:text-red-400 font-semibold px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all text-xs"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-600 text-sm">
                  No employees found or backend is offline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Termination Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-light text-zinc-100 mb-2">
              Terminate <span className="font-semibold text-red-500">Employee</span>
            </h2>
            
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to terminate <span className="text-zinc-200 font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</span> ({selectedEmployee.employeeCode})? This will mark them as inactive.
            </p>

            <div className="mb-4">
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Reason for Termination
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="e.g., Resigned, Contract terminated, Relocated..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50 mb-1 h-24 resize-none transition-colors"
                disabled={isDeleting}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeRemoveModal}
                disabled={isDeleting}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl hover:bg-zinc-850 hover:text-zinc-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={isDeleting || !deletionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/10 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Terminating...' : 'Confirm Termination'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Assign Sites Modal */}
      {assigningEmployee && (
        <AssignSitesModal
          employee={assigningEmployee}
          onClose={() => setAssigningEmployee(null)}
        />
      )}
    </div>
  );
}
