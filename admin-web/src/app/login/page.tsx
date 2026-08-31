'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEmployees } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string || (role === 'admin' ? 'admin@fieldops.com' : 'john.doe@fieldops.com');

    // Store email in cookie
    document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400`;

    if (role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/employee');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-700/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-10 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-xl">F</span>
            </div>
          </div>
          <h1 className="text-3xl font-light text-zinc-100 tracking-tight">FieldOps</h1>
          <p className="text-zinc-400 mt-2 font-medium tracking-wide uppercase text-xs">Secure Access</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-zinc-950/50 p-1.5 rounded-xl mb-8 border border-zinc-800">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2.5 text-sm font-semibold tracking-wider uppercase rounded-lg transition-all ${
              role === 'admin' 
                ? 'bg-zinc-800 text-amber-500 shadow-md border border-zinc-700/50' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('employee')}
            className={`flex-1 py-2.5 text-sm font-semibold tracking-wider uppercase rounded-lg transition-all ${
              role === 'employee' 
                ? 'bg-zinc-800 text-amber-500 shadow-md border border-zinc-700/50' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Employee
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              {role === 'admin' ? 'Email' : 'Select Employee'}
            </label>
            {role === 'admin' ? (
              <input 
                type="email" 
                name="email"
                defaultValue="admin@fieldops.com"
                className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
              />
            ) : (
              <select
                name="email"
                className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.user?.email || ''}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              name="password"
              defaultValue="password123"
              className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              className="group relative overflow-hidden w-full flex justify-center py-4 px-4 border border-amber-500/30 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] text-sm font-medium text-amber-500 bg-zinc-900 hover:bg-zinc-800 hover:border-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-zinc-950"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10 uppercase tracking-widest font-bold">Sign In as {role === 'admin' ? 'Admin' : 'Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
