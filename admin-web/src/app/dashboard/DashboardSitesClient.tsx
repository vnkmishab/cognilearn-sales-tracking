'use client';

import { useState } from 'react';

interface Site {
  id: string;
  name: string;
  siteCode: string;
  isActive: boolean;
}

interface DashboardSitesClientProps {
  initialSites: Site[];
}

export default function DashboardSitesClient({ initialSites }: DashboardSitesClientProps) {
  const [filter, setFilter] = useState<'ACTIVE' | 'INACTIVE' | 'TOTAL'>('ACTIVE');

  const activeSites = initialSites.filter((s) => s.isActive);
  const inactiveSites = initialSites.filter((s) => !s.isActive);
  const totalCount = initialSites.length;

  const getDisplayedSites = () => {
    switch (filter) {
      case 'ACTIVE':
        return activeSites;
      case 'INACTIVE':
        return inactiveSites;
      case 'TOTAL':
        return initialSites;
    }
  };

  const displayedSites = getDisplayedSites();

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Sites Overview
        </h2>
        
        {/* Tab Selectors */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 text-xs font-medium">
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ACTIVE'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active ({activeSites.length})
          </button>
          <button
            onClick={() => setFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'INACTIVE'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Inactive ({inactiveSites.length})
          </button>
          <button
            onClick={() => setFilter('TOTAL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'TOTAL'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Total ({totalCount})
          </button>
        </div>
      </div>

      {displayedSites.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-[320px] flex-1 pr-1">
          {displayedSites.map((site) => (
            <div key={site.id} className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
              <div>
                <span className="font-semibold text-zinc-200 block">{site.name}</span>
                <span className="text-zinc-500 text-xs">{site.siteCode}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                site.isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-850 text-zinc-400 border-zinc-850'
              }`}>
                {site.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-500 text-sm flex-1 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          No {filter.toLowerCase()} sites found.
        </div>
      )}
    </div>
  );
}
