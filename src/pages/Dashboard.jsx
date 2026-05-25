import React from 'react'
import { useStore } from '../store/useStore'
import XPBar from '../components/gamification/XPBar'

function ProgressRing({percent=0}){
  const stroke = 8
  const radius = 48
  const c = 2*Math.PI*radius
  return (
    <svg width="120" height="120">
      <g transform="translate(60,60)">
        <circle r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="transparent" />
        <circle r={radius} stroke="#7C3AED" strokeWidth={stroke} fill="transparent" strokeDasharray={`${(percent/100)*c} ${c}`} strokeLinecap="round" transform="rotate(-90)" />
        <text x="0" y="6" textAnchor="middle" fontSize="18" fill="white">{Math.round(percent)}%</text>
      </g>
    </svg>
  )
}

export default function Dashboard(){
  const {habits, gamification, sessions} = useStore()
  const total = habits.length || 1
  const done = habits.filter(h=>h.completed).length
  const percent = (done/total)*100
  const summary = gamification || { xp: 0, level: 1, nextLevelXp: 100, levelName: 'Novice', currentStreak: 0, badges: [] }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-heading">Good day — Habits</h1>
        <p className="text-sm text-muted">Today • {new Date().toLocaleDateString()}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-6">
          <div className="flex items-center gap-6">
            <ProgressRing percent={percent} />
            <div>
              <div className="text-xl font-medium">Streak: 🔥 {summary.currentStreak} days</div>
              <div className="text-sm text-muted">{done} / {habits.length} completed today</div>
              <div className="text-sm text-muted mt-1">Focus sessions: {sessions.length}</div>
            </div>
          </div>
        </section>

        <XPBar {...summary} />
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="card p-4"><div className="text-sm text-muted">Habit XP</div><div className="text-2xl font-semibold">{summary.xp}</div></div>
        <div className="card p-4"><div className="text-sm text-muted">Level</div><div className="text-2xl font-semibold">{summary.level}</div></div>
        <div className="card p-4"><div className="text-sm text-muted">Badges</div><div className="text-2xl font-semibold">{summary.badges.length}</div></div>
        <div className="card p-4"><div className="text-sm text-muted">Focus minutes</div><div className="text-2xl font-semibold">{summary.totalFocusMinutes || 0}</div></div>
      </section>
    </div>
  )
}
