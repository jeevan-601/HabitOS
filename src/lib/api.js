const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

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

  const url = `${API_BASE}${path}`

  try{
    const res = await fetch(url, { ...options, headers })
    if(!res.ok){
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Request failed')
    }
    return res.json()
  }catch(err){
    console.error('Network error', url, err)
    throw new Error('Network error: ' + (err.message || String(err)))
  }
}

export async function refreshSession(){
  const { refreshToken } = getTokens()
  if(!refreshToken) return null
  const url = `${API_BASE}/auth/refresh`
  try{
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if(!res.ok) return null
    const data = await res.json()
    if(data.accessToken) setTokens({ accessToken: data.accessToken })
    return data
  }catch(err){
    console.error('Network error', url, err)
    return null
  }
}

export { API_BASE }
