'use client';

import { useState } from 'react';
import AddSiteModal from '@/components/AddSiteModal';

interface SitesPageClientProps {
  initialSites: any[];
}

export default function SitesPageClient({ initialSites }: SitesPageClientProps) {
  const [sitesList, setSitesList] = useState(initialSites);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight">
          Construction Sites
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-sm"
        >
          Add Site
        </button>
      </div>
      
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Site Name</th>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Project ID</th>
              <th className="p-4 font-semibold">Coordinates</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sitesList.length > 0 ? (
              sitesList.map((site) => (
                <tr key={site.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 font-medium text-zinc-300">{site.name}</td>
                  <td className="p-4 text-zinc-400">{site.siteCode}</td>
                  <td className="p-4 text-zinc-500">{site.projectId || 'N/A'}</td>
                  <td className="p-4 text-xs text-zinc-500 font-mono">
                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                  </td>
                  <td className="p-4">
                    {site.isActive ? (
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border bg-zinc-800/50 text-zinc-400 border-zinc-700/50">
                        INACTIVE
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-650 text-sm">
                  No construction sites configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddSiteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSiteCreated={(newSite) => setSitesList(prev => [newSite, ...prev])} 
      />
    </div>
  );
}
