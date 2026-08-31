import Link from 'next/link';
import NotificationsTray from './NotificationsTray';
import AIChatbot from '@/components/AIChatbot';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-10 relative">
        <div className="p-6 text-2xl font-bold border-b border-zinc-800 text-amber-500 tracking-wider flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20"></div>
          FieldOps Admin
        </div>
        <div className="px-6 py-4 bg-zinc-950/50 border-b border-zinc-800 text-sm font-medium text-zinc-400">
          Logged in as: <span className="text-zinc-200">Admin</span>
          <div className="text-xs text-amber-500/70 mt-1 uppercase tracking-widest">Administrator</div>
        </div>
        
        <NotificationsTray />

        <nav className="flex-1 p-4 space-y-2 text-zinc-400 mt-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Dashboard
          </Link>
          <Link href="/dashboard/employees" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Employees
          </Link>
          <Link href="/dashboard/sites" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Sites
          </Link>
          <Link href="/dashboard/attendance" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Attendance
          </Link>
          <Link href="/dashboard/site-visits" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Site Visits
          </Link>
          <Link href="/dashboard/expenses" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 hover:text-amber-400 hover:shadow-lg hover:shadow-black/20 transition-all font-medium border border-transparent hover:border-zinc-700/50">
            Expenses Review
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <Link href="/login" className="block px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg font-medium transition-colors border border-transparent hover:border-red-900/30 text-center">
            Sign Out
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
      <AIChatbot role="ADMIN" />
    </div>
  );
}
