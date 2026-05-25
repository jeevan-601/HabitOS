import React, { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function Notifications(){
  const notifications = useStore(s => s.notifications)
  const loadNotifications = useStore(s => s.loadNotifications)
  const markNotificationRead = useStore(s => s.markNotificationRead)
  const markAllNotificationsRead = useStore(s => s.markAllNotificationsRead)

  useEffect(() => { loadNotifications() }, [loadNotifications])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-heading">Notifications</h2>
        <button onClick={markAllNotificationsRead} className="px-3 py-2 border rounded-btn">Mark all read</button>
      </div>

      <div className="space-y-2">
        {notifications.length ? notifications.map(notification => (
          <button
            key={notification.id}
            onClick={() => markNotificationRead(notification.id)}
            className={`w-full text-left card p-4 border transition ${notification.read_at ? 'opacity-60' : 'border-accent/50'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm text-muted">{notification.body}</div>
              </div>
              <div className="text-xs text-muted whitespace-nowrap">{new Date(notification.created_at).toLocaleString()}</div>
            </div>
          </button>
        )) : <div className="card p-4 text-muted">No notifications yet.</div>}
      </div>
    </div>
  )
}
