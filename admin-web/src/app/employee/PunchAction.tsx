'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleMyPunch } from '@/lib/api';

export default function PunchAction({ initialIsCheckedIn }: { initialIsCheckedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePunch = async () => {
    setLoading(true);
    try {
      await toggleMyPunch();
      router.refresh();
      // Add a tiny delay to allow Next.js server components to re-render
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (e) {
      alert('Failed to register punch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePunch}
      disabled={loading}
      className={`group relative overflow-hidden px-6 py-4 rounded-xl shadow-lg transition-all font-medium disabled:opacity-50 min-w-[140px] border ${
        initialIsCheckedIn 
          ? 'bg-zinc-800 border-red-500/30 hover:border-red-500 text-red-400' 
          : 'bg-zinc-800 border-emerald-500/30 hover:border-emerald-500 text-emerald-400'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${initialIsCheckedIn ? 'from-red-500/0 via-red-500/10 to-red-500/0' : 'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`}></div>
      <span className="relative z-10 tracking-wide">
        {loading ? 'Processing...' : initialIsCheckedIn ? 'Check Out' : 'Check In'}
      </span>
    </button>
  );
}
