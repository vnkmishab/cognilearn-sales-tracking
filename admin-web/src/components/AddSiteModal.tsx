'use client';

import { useState } from 'react';
import { createSite } from '@/lib/api';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (newSite: any) => void;
}

export default function AddSiteModal({ isOpen, onClose, onSiteCreated }: AddSiteModalProps) {
  const [name, setName] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [projectId, setProjectId] = useState('');
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [radius, setRadius] = useState('100');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name || !siteCode) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const latNum = 0;
    const lngNum = 0;
    const radNum = parseFloat(radius || '100');

    try {
      const data = {
        name,
        siteCode: siteCode.toUpperCase(),
        projectId: projectId || undefined,
        latitude: latNum,
        longitude: lngNum,
        geofenceRadius: radNum,
      };

      const newSite = await createSite(data);
      onSiteCreated(newSite);
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create construction site. The Site Code might already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSiteCode('');
    setProjectId('');
    setLatitude('');
    setLongitude('');
    setRadius('100');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Add New Construction Site
          </h3>
          <button 
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg transition-colors outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Site Name *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Site F"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Site Code *</label>
              <input
                required
                type="text"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="e.g. SIT-006"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="e.g. Project 6"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Geofence Radius (m)</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-sm font-semibold transition-colors outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all outline-none"
            >
              {isSubmitting ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
