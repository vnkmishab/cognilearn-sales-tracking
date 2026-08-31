export interface OfflinePunch {
  clientPunchId: string;
  employeeId: string; // "EMP-0010"
  siteId: string;
  punchType: 'IN' | 'OUT';
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  deviceId: string;
  timestamp: string; // The time the punch actually happened
}

const STORAGE_KEY = 'offline_punches';

export function savePunchOffline(punch: OfflinePunch) {
  if (typeof window === 'undefined') return;
  const currentPunches = getOfflinePunches();
  currentPunches.push(punch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPunches));
}

export function getOfflinePunches(): OfflinePunch[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearOfflinePunches() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
