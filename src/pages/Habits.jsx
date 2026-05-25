import React, { useEffect } from 'react'
import { useStore } from '../store/useStore'
import HabitList from '../components/habits/HabitList'
import HabitForm from '../components/habits/HabitForm'
import { useState, useMemo } from 'react'

export default function Habits(){
  const store = useStore()
  const deleteHabit = useStore(s => s.deleteHabit)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(()=>{ store.load() }, [store.load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...store.habits]
      .filter(h => (category === 'all' || (h.meta?.category || h.category || 'Custom') === category))
      .filter(h => !q || `${h.name} ${h.description || ''} ${h.meta?.notes || ''}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const aMeta = a.meta || {}
        const bMeta = b.meta || {}
        if(sortBy === 'name') return a.name.localeCompare(b.name)
        if(sortBy === 'category') return String(aMeta.category || '').localeCompare(String(bMeta.category || ''))
        if(sortBy === 'completion') return Number(b.completed) - Number(a.completed)
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [store.habits, query, category, sortBy])

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-2xl font-heading">Habits</h2>
      </header>
      <div className="card p-4 mb-4 grid gap-3 md:grid-cols-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search habits" className="w-full p-2 rounded-input bg-transparent border" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          {['all','Health','Fitness','Learning','Mindfulness','Work','Finance','Social','Custom'].map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          <option value="created_at">Newest</option>
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="completion">Completion</option>
        </select>
      </div>
      <div className="space-y-4">
        <HabitForm onAdd={h=>store.addHabit(h)} />
        <HabitList habits={filtered} onToggle={id=>store.toggleComplete(id)} onDelete={id=>deleteHabit(id)} />
      </div>
    </div>
  )
}
