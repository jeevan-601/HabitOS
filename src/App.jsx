import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Habits = lazy(() => import('./pages/Habits'))
const Focus = lazy(() => import('./pages/Focus'))
const Stats = lazy(() => import('./pages/Stats'))
const Profile = lazy(() => import('./pages/Profile'))
const Notifications = lazy(() => import('./pages/Notifications'))
import Auth from './pages/Auth'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import Header from './components/layout/Header'
import FAB from './components/layout/FAB'
import CommandPalette from './components/layout/CommandPalette'
import { useStore } from './store/useStore'
import { getTokens } from './lib/api'
import { trackPageView } from './lib/monitoring'

export default function App(){
  const [paletteOpen, setPaletteOpen] = useState(false)
  const load = useStore(s => s.load)
  const attachRealtime = useStore(s => s.attachRealtime)
  const authReady = useStore(s => s.authReady)
  const location = useLocation()

  useEffect(() => { load() }, [load])
  useEffect(() => { if(getTokens().accessToken) attachRealtime() }, [attachRealtime])
  useEffect(() => {
    const onKeyDown = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if(isShortcut){
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  useEffect(() => {
    if(getTokens().accessToken) trackPageView(location.pathname)
  }, [location.pathname])

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
      <a href="#main-content" className="sr-only-focusable">Skip to main content</a>
      <Sidebar />
      <main id="main-content" className="flex-1 p-6">
        <Header onOpenPalette={() => setPaletteOpen(true)} />
        <Suspense fallback={<div className="card p-6 text-muted">Loading section…</div>}>
          <Routes>
            <Route path="/auth" element={<Auth/>} />
            <Route path="/" element={<Dashboard/>} />
            <Route path="/habits" element={<Habits/>} />
            <Route path="/focus" element={<Focus/>} />
            <Route path="/stats" element={<Stats/>} />
            <Route path="/notifications" element={<Notifications/>} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
      <FAB />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
