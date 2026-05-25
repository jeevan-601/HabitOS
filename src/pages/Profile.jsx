import React from 'react'
import { useStore } from '../store/useStore'
import XPBar from '../components/gamification/XPBar'
import BadgeGrid from '../components/gamification/BadgeGrid'

function downloadJSON(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

export default function Profile(){
  const logout = useStore(s => s.logout)
  const gamification = useStore(s => s.gamification)

  function handleExport(){
    const habits = JSON.parse(localStorage.getItem('habits') || '[]')
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]')
    downloadJSON('habits-export.json', {habits, sessions, exportedAt:new Date().toISOString()})
  }

  function handleImport(e){
    const f = e.target.files[0]
    if(!f) return
    const r = new FileReader()
    r.onload = ()=>{
      try{ const obj = JSON.parse(r.result); if(obj.habits) localStorage.setItem('habits', JSON.stringify(obj.habits)); alert('Imported') }catch(e){ alert('Invalid file') }
    }
    r.readAsText(f)
  }

  return (
    <div>
      <h2 className="text-2xl font-heading mb-4">Profile</h2>
      <div className="space-y-4">
        <XPBar {...(gamification || { xp: 0, level: 1, nextLevelXp: 100, levelName: 'Novice' })} />
        <div className="card p-6 space-y-3">
          <div>User profile and settings go here.</div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleExport} className="px-3 py-2 bg-accent rounded-btn text-white">Export Data</button>
            <label className="px-3 py-2 border rounded-btn cursor-pointer">
              Import
              <input onChange={handleImport} type="file" accept="application/json" className="hidden" />
            </label>
            <button onClick={logout} className="px-3 py-2 border rounded-btn">Logout</button>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-heading mb-3">Badges</h3>
          <BadgeGrid badges={gamification?.badges || []} />
        </div>
      </div>
    </div>
  )
}
