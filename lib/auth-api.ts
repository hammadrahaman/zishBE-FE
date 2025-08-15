const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || `Login failed (${res.status})`);
  }
  const { token, user } = payload.data || {};
  if (token) {
    try {
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
    } catch {}
  }
  return user;
}

export function logout() {
  try {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  } catch {}
}


