const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export function getTokens(){
  return {
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || ''
  }
}

export function setTokens({ accessToken, refreshToken }){
  if(accessToken) localStorage.setItem('accessToken', accessToken)
  if(refreshToken) localStorage.setItem('refreshToken', refreshToken)
}

export function clearTokens(){
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export async function api(path, options = {}){
  const { accessToken } = getTokens()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if(accessToken) headers.Authorization = `Bearer ${accessToken}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if(!res.ok){
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Request failed')
  }
  return res.json()
}

export async function refreshSession(){
  const { refreshToken } = getTokens()
  if(!refreshToken) return null
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  if(!res.ok) return null
  const data = await res.json()
  if(data.accessToken) setTokens({ accessToken: data.accessToken })
  return data
}

export { API_BASE }
