import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  let email = 'john.doe@fieldops.com';
  try {
    const cookieStore = await cookies();
    email = cookieStore.get('user_email')?.value || 'john.doe@fieldops.com';
  } catch (e) {
    console.warn('Error reading cookies on server:', e);
  }
  return {
    'x-user-email': email,
  };
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

export async function fetchMyAttendance() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/attendance`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch personal attendance');
  return res.json();
}

export async function fetchMyExpenses() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/employee-portal/expenses`, {
    cache: 'no-store',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch personal expenses');
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
