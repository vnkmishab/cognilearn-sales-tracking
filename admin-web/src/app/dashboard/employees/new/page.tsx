'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEmployee } from '@/lib/api';

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    };

    try {
      await createEmployee(data);
      router.push('/dashboard/employees');
      router.refresh();
    } catch (err) {
      setError('Failed to create employee. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
          Add New <span className="font-medium text-amber-500">Employee</span>
        </h1>
        <Link href="/dashboard/employees" className="text-zinc-500 hover:text-zinc-300 transition text-sm">
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">First Name</label>
            <input 
              required
              name="firstName"
              type="text" 
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Last Name</label>
            <input 
              required
              name="lastName"
              type="text" 
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
          <input 
            required
            name="email"
            type="email" 
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
