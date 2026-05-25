import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../lib/api'
import { useStore } from '../store/useStore'

const sample = [
  {name:'Mon', v:2}, {name:'Tue', v:3}, {name:'Wed', v:1}, {name:'Thu', v:4}, {name:'Fri', v:2}, {name:'Sat', v:0}, {name:'Sun', v:1}
]

export default function Stats(){
  const gamification = useStore(s => s.gamification)
  const [monitoring, setMonitoring] = useState(null)

  useEffect(() => {
    let active = true
    api('/api/monitoring/summary')
      .then(data => { if(active) setMonitoring(data) })
      .catch(() => { if(active) setMonitoring(null) })
    return () => { active = false }
  }, [])

  const monitoringChart = useMemo(() => {
    return (monitoring?.daily || []).map(entry => ({
      name: entry.day.slice(5),
      events: entry.total,
      errors: entry.errors
    }))
  }, [monitoring])

  return (
    <div>
      <h2 className="text-2xl font-heading mb-4">Stats</h2>
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-4">
          <div className="text-sm text-muted">XP</div>
          <div className="text-2xl font-heading">{gamification?.xp || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Level</div>
          <div className="text-2xl font-heading">{gamification?.level || 1}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Errors tracked</div>
          <div className="text-2xl font-heading">{monitoring?.totalErrors || 0}</div>
        </div>
      </div>
      <div className="card p-6 mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sample}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="v" fill="var(--accent-strong)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-heading text-lg mb-4">Live telemetry</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monitoringChart.length ? monitoringChart : sample.map(item => ({ name: item.name, events: item.v, errors: 0 }))}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="events" fill="var(--accent-strong)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="errors" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-sm text-muted mt-3">
            {monitoring ? `${monitoring.totalEvents} tracked events in the last 7 days.` : 'Telemetry loads after sign-in.'}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-heading text-lg mb-4">Recent events</h3>
          <div className="space-y-3 max-h-[260px] overflow-auto pr-1">
            {(monitoring?.recentEvents || []).map(event => (
              <div key={`${event.created_at}-${event.name}`} className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-xs text-muted">{event.type} · {event.source}</div>
                </div>
                <div className="text-xs text-muted whitespace-nowrap">{new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
            {!monitoring?.recentEvents?.length ? <div className="text-muted">No telemetry yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
