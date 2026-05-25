import { create } from 'zustand'
import { api, clearTokens, getTokens, refreshSession, setTokens } from '../lib/api'
import { getSocket, resetSocket } from '../lib/socket'

export const useStore = create((set, get) => ({
  user: null,
  habits: [],
  sessions: [],
  gamification: null,
  notifications: [],
  authReady: false,
  loadGamification: async () => {
    try{
      const gamification = await api('/api/gamification')
      set({ gamification })
    }catch(e){}
  },
  loadSessions: async () => {
    try{
      const sessions = await api('/api/sessions')
      localStorage.setItem('sessions', JSON.stringify(sessions))
      set({ sessions })
    }catch(e){}
  },
  loadNotifications: async () => {
    try{
      const notifications = await api('/api/notifications')
      set({ notifications })
    }catch(e){}
  },
  load: async () => {
    try{
      const { accessToken, refreshToken } = getTokens()
      if(!accessToken && !refreshToken){
        set({ authReady: true })
        return
      }

      if(!accessToken && refreshToken){
        await refreshSession()
      }

      const habits = await api('/api/habits')
      set({ habits, authReady: true })
      const tokens = getTokens()
      if(tokens.accessToken){
        getSocket()
      }
      await get().loadGamification()
      await get().loadSessions()
      await get().loadNotifications()
    }catch(e){
      set({ authReady: true })
    }
  },
  login: async (payload) => {
    const data = await api('/auth/login', { method:'POST', body: JSON.stringify(payload) })
    setTokens(data)
    set({ user: data.user })
    resetSocket()
    getSocket()
    const habits = await api('/api/habits')
    set({ habits, authReady: true })
    await get().loadGamification()
    await get().loadSessions()
    await get().loadNotifications()
  },
  register: async (payload) => {
    const data = await api('/auth/register', { method:'POST', body: JSON.stringify(payload) })
    setTokens(data)
    set({ user: data.user })
    resetSocket()
    getSocket()
    const habits = await api('/api/habits')
    set({ habits, authReady: true })
    await get().loadGamification()
    await get().loadSessions()
    await get().loadNotifications()
  },
  logout: async () => {
    const { refreshToken } = getTokens()
    try{ await api('/auth/logout', { method:'POST', body: JSON.stringify({ refreshToken }) }) }catch(e){}
    clearTokens()
    resetSocket()
    set({ user: null, habits: [], authReady: true })
  },
  addHabit: async (habit) => {
    const created = await api('/api/habits', { method:'POST', body: JSON.stringify(habit) })
    set({ habits: [created, ...get().habits] })
    getSocket().emit('habit:created', created)
  },
  toggleComplete: async (id) => {
    const current = get().habits.find(h => h.id === id)
    if(!current) return
    const updated = await api(`/api/habits/${id}`, {
      method:'PUT',
      body: JSON.stringify({ ...current, completed: !current.completed })
    })
    set({ habits: get().habits.map(h => h.id === id ? updated : h) })
    getSocket().emit('habit:updated', updated)
  },
  deleteHabit: async (id) => {
    await api(`/api/habits/${id}`, { method:'DELETE' })
    set({ habits: get().habits.filter(h => h.id !== id) })
    getSocket().emit('habit:deleted', { id })
  },
  logSession: async (session) => {
    const created = await api('/api/sessions', { method:'POST', body: JSON.stringify(session) })
    const next = [created, ...get().sessions]
    localStorage.setItem('sessions', JSON.stringify(next))
    set({ sessions: next })
    getSocket().emit('session:created', created)
    await get().loadGamification()
    await get().loadNotifications()
  },
  markNotificationRead: async (id) => {
    const updated = await api(`/api/notifications/${id}/read`, { method:'PATCH' })
    set({ notifications: get().notifications.map(n => n.id === id ? updated : n) })
  },
  markAllNotificationsRead: async () => {
    await api('/api/notifications/read-all', { method:'POST' })
    set({ notifications: get().notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })) })
  },
  attachRealtime: () => {
    const socket = getSocket()
    socket.off('habit:created')
    socket.off('habit:updated')
    socket.off('habit:deleted')
    socket.off('session:created')
    socket.off('notification:new')
    socket.off('notification:read')
    socket.off('notification:read-all')
    socket.on('habit:created', habit => set({ habits: [habit, ...get().habits.filter(h => h.id !== habit.id)] }))
    socket.on('habit:updated', habit => set({ habits: get().habits.map(h => h.id === habit.id ? habit : h) }))
    socket.on('habit:deleted', ({ id }) => set({ habits: get().habits.filter(h => h.id !== id) }))
    socket.on('session:created', session => set({ sessions: [session, ...get().sessions.filter(s => s.id !== session.id)] }))
    socket.on('notification:new', notification => set({ notifications: [notification, ...get().notifications] }))
    socket.on('notification:read', notification => set({ notifications: get().notifications.map(n => n.id === notification.id ? notification : n) }))
    socket.on('notification:read-all', () => set({ notifications: get().notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })) }))
  }
}))
