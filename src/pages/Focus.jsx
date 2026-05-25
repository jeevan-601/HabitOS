import React, {useState, useEffect, useRef, useMemo} from 'react'
import { useStore } from '../store/useStore'

export default function Focus(){
  const [seconds, setSeconds] = useState(25*60)
  const [running, setRunning] = useState(false)
  const [task, setTask] = useState('')
  const [selectedHabitId, setSelectedHabitId] = useState('')
  const [showCompleteMessage, setShowCompleteMessage] = useState(false)
  const habits = useStore(s => s.habits)
  const logSession = useStore(s => s.logSession)
  const timer = useRef(null)

  useEffect(()=>{
    if(running){
      timer.current = setInterval(()=> setSeconds(s=>s-1),1000)
    } else if(timer.current) { clearInterval(timer.current) }
    return ()=> clearInterval(timer.current)
  },[running])

  useEffect(()=>{
    if(seconds <= 0){
      setRunning(false)
      setShowCompleteMessage(true)
      const durationMinutes = 25
      logSession({
        habitId: selectedHabitId ? Number(selectedHabitId) : null,
        task,
        durationMinutes,
        startedAt: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        meta: { mode: 'pomodoro' }
      }).catch(()=>{})
      setTimeout(()=> setShowCompleteMessage(false), 3500)
    }
  },[seconds, task, selectedHabitId, logSession])

  const minutes = Math.floor(seconds/60).toString().padStart(2,'0')
  const secs = (seconds%60).toString().padStart(2,'0')
  const percent = useMemo(() => (1 - seconds / (25 * 60)) * 100, [seconds])

  return (
    <div>
      <h2 className="text-2xl font-heading mb-4">Focus Timer</h2>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="card p-6 text-center space-y-4">
          <div className="mx-auto w-56 h-56 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-50" style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }} />
            <div>
              <div className="text-5xl font-mono">{minutes}:{secs}</div>
              <div className="text-sm text-muted mt-2">{running ? 'Focus' : 'Ready'}</div>
            </div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={()=>setRunning(r=>!r)} className="px-4 py-2 bg-accent rounded-btn text-white">{running? 'Pause':'Start'}</button>
            <button onClick={()=>{ setRunning(false); setSeconds(25*60)}} className="px-4 py-2 border rounded-btn">Reset</button>
          </div>
          {showCompleteMessage ? <div className="text-green-400 text-sm">Session complete. Logged to history.</div> : null}
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">What are you working on?</label>
            <input value={task} onChange={e => setTask(e.target.value)} className="w-full p-3 rounded-input bg-transparent border" placeholder="Coding practice, reading, writing..." />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Link to habit</label>
            <select value={selectedHabitId} onChange={e => setSelectedHabitId(e.target.value)} className="w-full p-3 rounded-input bg-transparent border">
              <option value="">No linked habit</option>
              {habits.map(habit => <option key={habit.id} value={habit.id}>{habit.icon || '✨'} {habit.name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="card p-3"><div className="text-muted">Mode</div><div>Pomodoro</div></div>
            <div className="card p-3"><div className="text-muted">Session</div><div>1 / 4</div></div>
            <div className="card p-3"><div className="text-muted">DND</div><div>{running ? 'On' : 'Off'}</div></div>
          </div>
          <div className="text-sm text-muted">
            Break suggestion: stretch, drink water, and look away from the screen for a minute.
          </div>
        </div>
      </div>
    </div>
  )
}
