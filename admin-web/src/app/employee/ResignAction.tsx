'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resignEmployee } from '@/lib/api';

export default function ResignAction() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitResignation = async () => {
    setLoading(true);
    setError(null);
    try {
      await resignEmployee(reason.trim() || 'No reason provided');
      
      // Clear user session cookie
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      
      // Redirect to login page
      router.push('/login');
    } catch (e) {
      console.error(e);
      setError('Failed to submit resignation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative overflow-hidden bg-zinc-800 text-red-500 border border-red-500/20 px-6 py-4 rounded-xl shadow-lg transition-all text-center block w-full hover:bg-red-500/5 hover:border-red-500/50 hover:text-red-400 font-medium"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="relative z-10 tracking-wide">Submit Resignation</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <h2 className="text-xl font-light text-zinc-100 mb-2">
              Submit <span className="font-semibold text-red-500">Resignation</span>
            </h2>
            
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed font-light">
              Are you sure you want to resign? Confirming will immediately mark your profile as inactive and log you out. This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Reason for Resignation (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Personal reasons, Career change..."
                className="w-full bg-zinc-905 border border-zinc-800 rounded-xl p-3 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50 mb-1 h-24 resize-none transition-colors"
                disabled={loading}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl hover:bg-zinc-850 hover:text-zinc-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResignation}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/10 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Confirm Resignation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
