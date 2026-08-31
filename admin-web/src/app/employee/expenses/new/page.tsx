'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitExpense } from '@/lib/api';

export default function SubmitExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData(e.currentTarget);
      await submitExpense(formData);
      router.push('/employee/expenses');
      router.refresh();
    } catch (e) {
      setError('Failed to submit expense. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">Submit New Expense</h1>
        <Link href="/employee" className="text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-sm font-medium uppercase tracking-wider">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" encType="multipart/form-data">
        {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Category</label>
          <select 
            required
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner cursor-pointer"
          >
            <option value="">Select a category</option>
            <option value="TRAVEL">Travel</option>
            <option value="MEALS">Meals</option>
            <option value="SUPPLIES">Supplies</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Amount (₹)</label>
          <input 
            required
            name="amount"
            type="number" 
            step="0.01"
            className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            {category === 'OTHER' ? "Reason (Required)" : "Description (Optional)"}
          </label>
          <textarea 
            name="description"
            required={category === 'OTHER'}
            rows={3}
            className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
            placeholder={category === 'OTHER' ? "Please explain the reason for selecting 'Other' category..." : "Provide any additional details..."}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Proof / Receipt (Optional)</label>
          <input 
            type="file"
            name="proof"
            accept="image/*,.pdf"
            className="w-full px-4 py-3 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer"
          />
        </div>

        <div className="pt-6 border-t border-zinc-800 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="group relative overflow-hidden bg-zinc-800 border border-amber-500/30 hover:border-amber-500 text-amber-400 px-8 py-3 rounded-xl shadow-lg transition-all font-medium disabled:opacity-50 tracking-wide"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10">{loading ? 'Submitting...' : 'Submit Expense'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
