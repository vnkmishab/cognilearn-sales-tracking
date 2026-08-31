'use client';

import { useState, useEffect } from 'react';
import { fetchSites, syncSitePunches } from '@/lib/api';
import { savePunchOffline, getOfflinePunches, clearOfflinePunches, generateUUID, OfflinePunch } from '@/lib/offlineSync';

export default function SitePunchForm({ 
  employeeCode = 'EMP-0010',
  initialIsCheckedIn = false,
  initialSiteId = ''
}: { 
  employeeCode?: string;
  initialIsCheckedIn?: boolean;
  initialSiteId?: string | null;
}) {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState(initialSiteId || '');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(initialIsCheckedIn);

  useEffect(() => {
    // Initial fetches
    setIsOnline(navigator.onLine);
    setPendingCount(getOfflinePunches().length);
    fetchSites()
      .then((data) => {
        let list = [...data];
        if (initialSiteId && !list.some((s: any) => s.id === initialSiteId)) {
          list.push({
            id: initialSiteId,
            name: 'Active Site (Locked)',
            siteCode: 'ACTIVE'
          });
        }
        setSites(list);
      })
      .catch(console.error);

    // Online/Offline listeners
    const handleOnline = async () => {
      setIsOnline(true);
      await attemptSync();
    };
    const handleOffline = () => setIsOnline(false);

    const handleSelectSite = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.siteId) {
        setSelectedSite(customEvent.detail.siteId);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('select-site-from-chat', handleSelectSite);

    // Attempt sync on mount if online and has pending
    if (navigator.onLine && getOfflinePunches().length > 0) {
      attemptSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('select-site-from-chat', handleSelectSite);
    };
  }, []);

  const attemptSync = async () => {
    const offlinePunches = getOfflinePunches();
    if (offlinePunches.length === 0) return;

    try {
      await syncSitePunches(offlinePunches);
      clearOfflinePunches();
      setPendingCount(0);
      alert(`Successfully synced ${offlinePunches.length} offline punches!`);
    } catch (e) {
      console.error('Failed to sync', e);
    }
  };

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      
      // Try high accuracy fresh location first
      navigator.geolocation.getCurrentPosition(resolve, () => {
        // Fallback: try low accuracy cached location
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity
        });
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000 // 1 minute cache
      });
    });
  };

  const handlePunch = async (punchType: 'IN' | 'OUT') => {
    if (!selectedSite) {
      alert('Please select a site first.');
      return;
    }

    setLoading(true);
    let lat = null;
    let lng = null;
    let acc = null;

    try {
      const position = await getLocation();
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      acc = position.coords.accuracy;
    } catch (e) {
      console.warn("Could not get exact location, proceeding without GPS or with last known.");
    }

    const newPunch: OfflinePunch = {
      clientPunchId: generateUUID(),
      employeeId: employeeCode,
      siteId: selectedSite,
      punchType,
      latitude: lat,
      longitude: lng,
      gpsAccuracy: acc,
      deviceId: 'web-browser',
      timestamp: new Date().toISOString()
    };

    if (isOnline) {
      try {
        await syncSitePunches([newPunch]);
        alert(`Site Punch ${punchType} successful!`);
        setIsCheckedIn(punchType === 'IN');
      } catch (e) {
        // Fallback to offline if server is unreachable despite navigator.onLine being true
        savePunchOffline(newPunch);
        setPendingCount(getOfflinePunches().length);
        alert(`Saved ${punchType} punch offline. Will sync when connection is restored.`);
        setIsCheckedIn(punchType === 'IN');
      }
    } else {
      savePunchOffline(newPunch);
      setPendingCount(getOfflinePunches().length);
      alert(`Saved ${punchType} punch offline. Will sync when connection is restored.`);
      setIsCheckedIn(punchType === 'IN');
    }

    setLoading(false);
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Site Punch
        </h2>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full tracking-wider">
              {pendingCount} PENDING
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border tracking-wider flex items-center gap-1.5 ${
            isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          {sites.length > 0 ? (
            <div className="mb-4 bg-zinc-950/50 border border-zinc-800/80 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Your Assigned Sites</span>
              <div className="flex flex-wrap gap-1.5">
                {sites.map(site => (
                  <span key={site.id} className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                    {site.name} ({site.siteCode})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 bg-red-500/5 border border-red-500/10 p-3 rounded-xl animate-pulse">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Warning</span>
              <p className="text-xs text-zinc-400">
                No construction sites currently assigned to you. Please contact the administrator.
              </p>
            </div>
          )}

          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Select Current Site</label>
          <select 
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            disabled={sites.length === 0 || (isCheckedIn && !!selectedSite)}
            className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Choose a site --</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name} ({site.siteCode})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-2">
          {!isCheckedIn ? (
            <button 
              onClick={() => handlePunch('IN')}
              disabled={loading || !selectedSite}
              className="group relative flex-1 overflow-hidden bg-zinc-800 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 px-4 py-3 rounded-xl shadow-lg transition-all font-medium disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {loading ? 'Processing...' : 'Punch In'}
            </button>
          ) : (
            <button 
              onClick={() => handlePunch('OUT')}
              disabled={loading || !selectedSite}
              className="group relative flex-1 overflow-hidden bg-zinc-800 border border-red-500/30 hover:border-red-500 text-red-400 px-4 py-3 rounded-xl shadow-lg transition-all font-medium disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {loading ? 'Processing...' : 'Punch Out'}
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-600 mt-2 flex items-start gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Requires Location Access. If offline, data is securely stored on your device and will sync automatically.
        </p>
      </div>
    </div>
  );
}
