'use client';

import { useState, useEffect } from 'react';
import { fetchAllSites, fetchEmployeeSites, updateEmployeeSites } from '@/lib/api';

interface AssignSitesModalProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  onClose: () => void;
}

interface Site {
  id: string;
  name: string;
  siteCode: string;
  isActive: boolean;
}

export default function AssignSitesModal({ employee, onClose }: AssignSitesModalProps) {
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [assignedSiteIds, setAssignedSiteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [sitesData, assignedIds] = await Promise.all([
          fetchAllSites(),
          fetchEmployeeSites(employee.id),
        ]);
        // Only allow assigning active sites
        setAllSites(sitesData.filter((s: Site) => s.isActive));
        setAssignedSiteIds(assignedIds);
      } catch (err) {
        console.error('Failed to load site assignments data:', err);
        alert('Failed to load sites. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employee.id]);

  const handleToggleSite = (siteId: string) => {
    setAssignedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    setAssignedSiteIds(allSites.map((s) => s.id));
  };

  const handleClearAll = () => {
    setAssignedSiteIds([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployeeSites(employee.id, assignedSiteIds);
      alert('Site assignments updated successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to save assignments:', err);
      alert('Failed to update assignments. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSites = allSites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.siteCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Assign Sites
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Employee: <span className="text-amber-500 font-semibold">{employee.firstName} {employee.lastName} ({employee.employeeCode})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex-1 py-16 flex flex-col items-center justify-center text-zinc-500">
            <svg className="animate-spin h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Loading sites and assignments...</span>
          </div>
        ) : (
          <div className="p-6 flex flex-col flex-1 overflow-hidden">
            {/* Search Site & Bulk Helpers */}
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Search sites by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder-zinc-650 outline-none focus:border-amber-500/50 transition-colors"
              />
              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>Selected: {assignedSiteIds.length} / {allSites.length} sites</span>
                <div className="flex gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="text-amber-500/80 hover:text-amber-500 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-zinc-500 hover:text-zinc-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Sites Checklist Container */}
            <div className="flex-1 overflow-y-auto border border-zinc-850 rounded-xl bg-zinc-950/30 p-2 space-y-1 max-h-[300px]">
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => {
                  const isChecked = assignedSiteIds.includes(site.id);
                  return (
                    <label
                      key={site.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                          : 'border-transparent hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSite(site.id)}
                          className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-zinc-900 bg-zinc-900"
                        />
                        <div>
                          <span className="font-semibold text-sm text-zinc-200 block">
                            {site.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {site.siteCode}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-850 border border-zinc-700/50 text-zinc-400 rounded">
                        Active
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="py-12 text-center text-zinc-650 text-sm">
                  No matching sites found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Assignments'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
