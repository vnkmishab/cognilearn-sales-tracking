'use client';

import { useState, useEffect } from 'react';
import DownloadSiteVisitsReport from './DownloadSiteVisitsReport';

interface SiteVisitsPageClientProps {
  initialPunches: any[];
}

export default function SiteVisitsPageClient({ initialPunches }: SiteVisitsPageClientProps) {
  const [selectedPunch, setSelectedPunch] = useState<any | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');

  const uniqueEmployees = Array.from(
    new Map(
      initialPunches
        .filter((p) => p.employee)
        .map((p) => [p.employee!.id, p.employee!])
    ).values()
  );

  const filteredPunches = initialPunches.filter((punch) => {
    if (selectedEmployee !== 'ALL' && punch.employee?.id !== selectedEmployee) return false;
    return true;
  });

  useEffect(() => {
    const handleSelectEmployee = (e: any) => {
      if (e.detail?.employeeId) {
        setSelectedEmployee(e.detail.employeeId);
      }
    };

    window.addEventListener('select-employee-from-chat', handleSelectEmployee);
    return () => {
      window.removeEventListener('select-employee-from-chat', handleSelectEmployee);
    };
  }, []);

  useEffect(() => {
    if (!selectedPunch || selectedPunch.latitude === null || selectedPunch.longitude === null) {
      setLocationAddress('');
      return;
    }

    const fetchAddress = async () => {
      setLoadingAddress(true);
      setLocationAddress('Resolving address details...');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${selectedPunch.latitude}&lon=${selectedPunch.longitude}`,
          {
            headers: {
              'Accept-Language': 'en',
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setLocationAddress(data.display_name || 'Address details not available');
        } else {
          setLocationAddress('Failed to resolve address details');
        }
      } catch (e) {
        setLocationAddress('Failed to connect to location database');
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [selectedPunch]);

  const handleOpenMap = (e: React.MouseEvent, punch: any) => {
    e.preventDefault();
    setSelectedPunch(punch);
  };

  const handleCloseMap = () => {
    setSelectedPunch(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light text-zinc-100 tracking-tight flex items-center gap-3">
          Site Visits
          <span className="text-sm font-medium bg-zinc-800/80 text-amber-500 px-3 py-1 rounded-full border border-zinc-700/50 animate-fade-in" key={filteredPunches.length}>
            Total: {filteredPunches.length}
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <select 
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner cursor-pointer"
          >
            <option value="ALL">All Employees</option>
            {uniqueEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          <DownloadSiteVisitsReport sitePunches={filteredPunches} />
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Employee</th>
              <th className="p-4 font-semibold">Site Assigned</th>
              <th className="p-4 font-semibold">Punch Type</th>
              <th className="p-4 font-semibold">Coordinates / Accuracy</th>
              <th className="p-4 font-semibold font-mono">Device ID</th>
              <th className="p-4 font-semibold">Sync Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredPunches.length > 0 ? (
              filteredPunches.map((punch) => (
                <tr key={punch.id} className="border-b border-zinc-800/50 text-sm hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-zinc-300">
                      {punch.employee?.firstName} {punch.employee?.lastName}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {punch.employee?.employeeCode}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-zinc-300">
                      {punch.site?.name}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {punch.site?.siteCode}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                      punch.punchType === 'IN' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
                    }`}>
                      PUNCH {punch.punchType}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-400 text-xs">
                    {punch.latitude !== null && punch.latitude !== undefined && punch.longitude !== null && punch.longitude !== undefined ? (
                      <a
                        href="#"
                        onClick={(e) => handleOpenMap(e, punch)}
                        className="hover:text-amber-400 hover:underline flex items-center gap-1.5 transition-colors group cursor-pointer"
                        title="View Site Location Map"
                      >
                        <span>
                          {punch.latitude.toFixed(5)}, {punch.longitude.toFixed(5)}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    ) : (
                      <span>--</span>
                    )}
                    {punch.gpsAccuracy !== null && punch.gpsAccuracy !== undefined && (
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Accuracy: ±{punch.gpsAccuracy.toFixed(1)}m
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-mono text-xs text-zinc-500">
                    {punch.deviceId || 'N/A'}
                  </td>
                  <td className="p-4 text-zinc-400 text-xs font-light">
                    {new Date(punch.syncedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-600 text-sm">
                  No site visit logs found or backend is offline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Google Map Dialog Modal */}
      {selectedPunch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in text-left">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-zinc-900 border-b border-zinc-850 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location Map Details
                </h3>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  Site Visit Pinpoint GPS Coordinates
                </p>
              </div>
              <button 
                onClick={handleCloseMap}
                className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg transition-colors outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 font-sans">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">Employee</span>
                  <span className="text-zinc-200 font-medium">{selectedPunch.employee?.firstName} {selectedPunch.employee?.lastName}</span>
                  <span className="text-zinc-400 block text-xs mt-0.5 font-mono">({selectedPunch.employee?.employeeCode})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">Site Visited</span>
                  <span className="text-zinc-200 font-medium">{selectedPunch.site?.name}</span>
                  <span className="text-zinc-400 block text-xs mt-0.5 font-mono">({selectedPunch.site?.siteCode})</span>
                </div>
                <div className="col-span-2 pt-3 border-t border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider mb-1">Location Address Details</span>
                  <span className={`text-zinc-300 font-medium ${loadingAddress ? 'animate-pulse text-zinc-400 italic' : ''} text-xs block leading-relaxed`}>
                    {locationAddress}
                  </span>
                </div>
              </div>

              {/* Free OpenStreetMap Embed IFrame */}
              <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 h-[360px] w-full">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPunch.longitude - 0.005},${selectedPunch.latitude - 0.005},${selectedPunch.longitude + 0.005},${selectedPunch.latitude + 0.005}&layer=mapnik&marker=${selectedPunch.latitude},${selectedPunch.longitude}`}
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0}
                  title="Embedded Geolocation Map"
                  className="rounded-xl"
                ></iframe>
              </div>

              <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                <span>GPS Accuracy: ±{selectedPunch.gpsAccuracy?.toFixed(1) || '0'} meters</span>
                <span>Coordinates: {selectedPunch.latitude.toFixed(6)}, {selectedPunch.longitude.toFixed(6)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950/40 border-t border-zinc-800 flex justify-end">
              <button
                onClick={handleCloseMap}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-xl text-sm font-semibold transition-colors outline-none"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
