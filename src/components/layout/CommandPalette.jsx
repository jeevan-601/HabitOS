import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const commands = [
  { label: 'Dashboard', path: '/' },
  { label: 'Habits', path: '/habits' },
  { label: 'Focus', path: '/focus' },
  { label: 'Stats', path: '/stats' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Profile', path: '/profile' }
]

export default function CommandPalette({ open, onClose }){
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if(open){
      setQuery('')
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    if(!value) return commands
    return commands.filter(command => command.label.toLowerCase().includes(value))
  }, [query])

  useEffect(() => {
    const onKeyDown = (event) => {
      if(event.key === 'Escape') onClose()
    }
    if(open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if(!open) return null

  const goTo = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center px-4 pt-24" role="dialog" aria-modal="true" aria-label="Quick command palette">
      <div className="card w-full max-w-xl p-4 shadow-2xl">
        <label className="block text-sm text-muted mb-2">Quick actions</label>
        <input
          ref={inputRef}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Type to search routes..."
          className="w-full p-3 rounded-input bg-transparent border mb-4"
        />
        <div className="space-y-2 max-h-72 overflow-auto">
          {results.map(command => (
            <button
              key={command.path}
              onClick={() => goTo(command.path)}
              className="w-full text-left px-4 py-3 rounded-btn border border-white/10 hover:bg-white/5 focus-visible:bg-white/5"
            >
              <div className="font-medium">{command.label}</div>
              <div className="text-xs text-muted">Go to {command.path}</div>
            </button>
          ))}
          {!results.length ? <div className="text-sm text-muted px-2 py-4">No matches.</div> : null}
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted">
          <span>Esc to close</span>
          <span>Cmd/Ctrl + K</span>
        </div>
      </div>
    </div>
  )
}
