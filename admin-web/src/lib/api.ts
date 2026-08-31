const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  let email = 'john.doe@fieldops.com';
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )user_email=([^;]*)/);
    if (match) {
      email = decodeURIComponent(match[1]);
    }
  }
  return {
    'x-user-email': email,
  };
}

export async function fetchSites() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/sites/my-sites`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
}

export async function fetchAllSites() {
  const res = await fetch(`${API_BASE_URL}/sites`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE_URL}/employees`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function createEmployee(data: { firstName: string; lastName: string; email: string }) {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return res.json();
}

export async function removeEmployee(id: string, reason: string) {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to remove employee');
  return res.json();
}

export async function submitExpense(data: FormData) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/expenses`, {
    method: 'POST',
    headers,
    body: data,
  });
  if (!res.ok) throw new Error('Failed to submit expense');
  return res.json();
}

export async function fetchAttendance() {
  const res = await fetch(`${API_BASE_URL}/attendance`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function fetchExpenses() {
  const res = await fetch(`${API_BASE_URL}/expenses`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

// --- Employee Portal Fetchers --- //

export async function toggleMyPunch() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/punch`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to punch');
  return res.json();
}

export async function fetchAvailableSites() {
  const res = await fetch(`${API_BASE_URL}/sites`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
}

export async function syncSitePunches(punches: any[]) {
  const res = await fetch(`${API_BASE_URL}/site-punches/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ punches }),
  });
  if (!res.ok) throw new Error('Failed to sync punches');
  return res.json();
}

export async function updateExpenseStatus(id: string, approvalStatus: string) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvalStatus }),
  });
  if (!res.ok) throw new Error('Failed to update expense status');
  return res.json();
}

export async function fetchMockStats() {
  // In a real scenario, this would hit a dashboard analytics endpoint on the backend
  return {
    employees: 30,
    presentToday: 24,
    pendingExpenses: 24,
    offlinePunchesPending: 7,
  };
}

export async function resignEmployee(reason: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/resign`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to resign employee');
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function fetchEmployeeSites(employeeId: string) {
  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/sites`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch employee sites');
  return res.json();
}

export async function updateEmployeeSites(employeeId: string, siteIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteIds }),
  });
  if (!res.ok) throw new Error('Failed to update employee sites');
  return res.json();
}

export async function fetchMyNotifications() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/notifications`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch employee notifications');
  return res.json();
}

export async function markMyNotificationRead(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/notifications/${id}/read`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
}

export async function fetchSitePunches() {
  const res = await fetch(`${API_BASE_URL}/site-punches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch site punches');
  return res.json();
}

export async function fetchMyStatus() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/status`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchMyProfile() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/me`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function createSite(data: any) {
  const res = await fetch(`${API_BASE_URL}/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create site');
  return res.json();
}
