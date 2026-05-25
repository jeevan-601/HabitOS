import React from 'react'

export default function HabitList({habits=[], onToggle=(()=>{}), onDelete=(()=>{})}){
  if(!habits.length) return <div className="card p-4">No habits yet — add one.</div>
  return (
    <div className="space-y-2">
      {habits.map(h=> (
        <div key={h.id} className="card p-3 flex items-center justify-between gap-3" style={{borderLeft: `4px solid ${h.color || 'var(--accent-strong)'}`}}>
          <div>
            <div className="font-medium flex items-center gap-2">
              <span>{h.icon || '✨'}</span>
              <span>{h.name}</span>
            </div>
            <div className="text-sm text-muted">{h.description}</div>
            <div className="text-xs text-muted mt-1">
              {(h.meta?.category || h.category || 'Custom')} • {(h.meta?.frequency || h.frequency || 'daily')}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>onToggle(h.id)} className={`px-3 py-1 rounded ${h.completed? 'bg-green-500':'bg-gray-600'}`}>
              {h.completed? 'Done':'Mark'}
            </button>
            <button onClick={()=>onDelete(h.id)} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
