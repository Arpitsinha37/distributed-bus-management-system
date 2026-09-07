export async function getCities(): Promise<string[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(`${API_URL}/routes/cities`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return [];
  return res.json();
}
