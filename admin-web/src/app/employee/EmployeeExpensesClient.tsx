'use client';

import { useState } from 'react';
import DownloadExpenseReport from '../dashboard/expenses/DownloadExpenseReport';

export default function EmployeeExpensesClient({ expenses }: { expenses: any[] }) {
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; category: string; uploadedAt: string } | null>(null);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-zinc-100">Recent Expenses</h2>
        <DownloadExpenseReport expenses={expenses} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Proof</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.slice(0, 5).map((expense) => {
              let proofUrl = null;
              if (expense.documents && expense.documents.length > 0) {
                const rawUrl = expense.documents[0].url;
                proofUrl = rawUrl.startsWith('s3://')
                  ? 'http://localhost:3000/uploads/mock-receipt.jpg'
                  : rawUrl.startsWith('/')
                  ? `http://localhost:3000${rawUrl}`
                  : rawUrl.replace('127.0.0.1:3000', 'localhost:3000');
              }
              return (
                <tr key={expense.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 font-medium text-zinc-300">{new Date(expense.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-zinc-400">{expense.category}</td>
                  <td className="py-4 font-medium text-zinc-200 font-mono">₹{expense.billAmount?.toFixed(2)}</td>
                  <td className="py-4">
                    {proofUrl ? (
                      <button 
                        onClick={() => setSelectedReceipt({
                          url: proofUrl,
                          category: expense.category,
                          uploadedAt: expense.documents[0].createdAt
                        })}
                        className="text-amber-500 hover:text-amber-400 hover:underline font-medium text-xs flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View
                      </button>
                    ) : (
                      <span className="text-zinc-600 text-xs italic">N/A</span>
                    )}
                  </td>
                  <td className="py-4">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                      expense.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      expense.approvalStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {expense.approvalStatus || 'DRAFT'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-zinc-600 text-sm">No expenses found.</td></tr>
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
                Receipt
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
                alt="Receipt Proof"
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
