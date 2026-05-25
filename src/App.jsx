import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Focus from './pages/Focus'
import Stats from './pages/Stats'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Auth from './pages/Auth'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import Header from './components/layout/Header'
import FAB from './components/layout/FAB'
import { useStore } from './store/useStore'
import { getTokens } from './lib/api'

export default function App(){
  const load = useStore(s => s.load)
  const attachRealtime = useStore(s => s.attachRealtime)
  const authReady = useStore(s => s.authReady)
  const location = useLocation()

  useEffect(() => { load() }, [load])
  useEffect(() => { if(getTokens().accessToken) attachRealtime() }, [attachRealtime])

  const signedIn = !!getTokens().accessToken || !!getTokens().refreshToken

  if(!authReady){
    return <div className="min-h-screen grid place-items-center text-muted">Loading…</div>
  }

  if(!signedIn && location.pathname !== '/auth'){
    return <Navigate to="/auth" replace />
  }

  if(location.pathname === '/auth' && signedIn){
    return <Navigate to="/" replace />
  }

  if(location.pathname === '/auth'){
    return <Auth />
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header />
        <Routes>
          <Route path="/auth" element={<Auth/>} />
          <Route path="/" element={<Dashboard/>} />
          <Route path="/habits" element={<Habits/>} />
          <Route path="/focus" element={<Focus/>} />
          <Route path="/stats" element={<Stats/>} />
          <Route path="/notifications" element={<Notifications/>} />
          <Route path="/profile" element={<Profile/>} />
        </Routes>
      </main>
      <BottomNav />
      <FAB />
    </div>
  )
}
