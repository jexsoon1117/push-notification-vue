import { useAuthStore } from '../stores/auth'

export async function apiPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const auth = useAuthStore()

  const res = await fetch(`http://localhost:8080${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.jwt}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}
