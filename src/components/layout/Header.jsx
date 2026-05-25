import React from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function Header(){
  const unreadCount = useStore(s => s.notifications.filter(notification => !notification.read_at).length)

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-heading">HabitOS</h1>
        <div className="text-sm text-muted">Track. Focus. Improve.</div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative px-3 py-2 bg-transparent border rounded-btn inline-flex items-center gap-2">
          <Bell size={16} />
          <span className="hidden sm:inline">Notifications</span>
          {unreadCount > 0 ? <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-accent text-[11px] flex items-center justify-center text-white">{unreadCount}</span> : null}
        </Link>
        <div className="hidden md:block">
          <button className="px-3 py-2 bg-transparent border rounded-btn">New</button>
        </div>
      </div>
    </header>
  )
}
