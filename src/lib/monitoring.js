import { api, getTokens } from './api'

let initialized = false

async function postEvent(path, payload){
  if(!getTokens().accessToken) return null
  try{
    return await api(path, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }catch(error){
    return null
  }
}

export function trackEvent(name, details = {}, type = 'event'){
  return postEvent('/api/monitoring/events', {
    type,
    name,
    details,
    source: 'client'
  })
}

export function trackError(error, context = {}){
  return postEvent('/api/monitoring/errors', {
    name: error?.name || 'error',
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    source: 'client'
  })
}

export function trackPageView(pathname){
  return trackEvent('page_view', { pathname }, 'navigation')
}

export function initClientMonitoring(){
  if(initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('error', event => {
    trackError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      kind: 'window_error'
    })
  })

  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason || 'Unhandled promise rejection'))
    trackError(reason, { kind: 'unhandledrejection' })
  })
}
