let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// Hilangkan trailing slash jika ada
API_URL = API_URL.replace(/\/$/, '');

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getCookieToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Bersihkan endpoint dari double slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const rawText = await res.text();
    // Hilangkan HTML tag jika backend mengembalikan HTML 404/500 Express
    const cleanMsg = rawText.replace(/<[^>]*>?/gm, '').trim();
    data = { message: cleanMsg || `HTTP Error ${res.status}` };
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `Terjadi kesalahan (${res.status})`);
  }

  return data as T;
}