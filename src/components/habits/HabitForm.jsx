import React, {useState} from 'react'

const colorSwatches = ['#06B6D4','#14B8A6','#3B82F6','#84CC16','#F97316','#FB7185','#F59E0B','#F43F5E','#94A3B8','#A855F7','#22C55E']

export default function HabitForm({onAdd=(()=>{})}){
  const [name,setName] = useState('')
  const [desc,setDesc] = useState('')
  const [icon,setIcon] = useState('✨')
  const [color,setColor] = useState(colorSwatches[0])
  const [category,setCategory] = useState('Health')
  const [frequency,setFrequency] = useState('daily')
  const [target,setTarget] = useState('')
  const [unit,setUnit] = useState('')
  const [reminderTime,setReminderTime] = useState('')
  const [enabledReminder,setEnabledReminder] = useState(false)
  const [habitType,setHabitType] = useState('build')
  const [difficulty,setDifficulty] = useState('medium')
  const [startDate,setStartDate] = useState('')
  const [notes,setNotes] = useState('')

  function submit(e){
    e.preventDefault()
    if(!name.trim()) return
    onAdd({
      id:Date.now(),
      name,
      description:desc,
      completed:false,
      icon,
      color,
      category,
      frequency,
      target,
      unit,
      reminderTime,
      enabledReminder,
      habitType,
      difficulty,
      startDate,
      notes
    })
    setName('')
    setDesc('')
    setIcon('✨')
    setTarget('')
    setUnit('')
    setNotes('')
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} maxLength={60} placeholder="Habit name" className="w-full p-2 rounded-input bg-transparent border" />
        <input value={icon} onChange={e=>setIcon(e.target.value)} placeholder="Icon / emoji" className="w-full p-2 rounded-input bg-transparent border" />
      </div>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description (optional)" className="w-full p-2 rounded-input bg-transparent border" />
      <div className="grid md:grid-cols-3 gap-3">
        <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          {['Health','Fitness','Learning','Mindfulness','Work','Finance','Social','Custom'].map(option => <option key={option}>{option}</option>)}
        </select>
        <select value={frequency} onChange={e=>setFrequency(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          <option value="daily">Daily</option>
          <option value="weekly">Specific days of week</option>
          <option value="x_week">X times per week</option>
          <option value="x_month">X times per month</option>
          <option value="every_n_days">Every N days</option>
        </select>
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target / quantity" className="w-full p-2 rounded-input bg-transparent border" />
        <input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="Unit (minutes, reps, km)" className="w-full p-2 rounded-input bg-transparent border" />
        <input value={startDate} onChange={e=>setStartDate(e.target.value)} type="date" className="w-full p-2 rounded-input bg-transparent border" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="flex items-center gap-2 border rounded-input p-2">
          <input type="checkbox" checked={enabledReminder} onChange={e=>setEnabledReminder(e.target.checked)} />
          Reminder enabled
        </label>
        <input value={reminderTime} onChange={e=>setReminderTime(e.target.value)} type="time" className="w-full p-2 rounded-input bg-transparent border" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <select value={habitType} onChange={e=>setHabitType(e.target.value)} className="w-full p-2 rounded-input bg-transparent border">
          <option value="build">Build habit</option>
          <option value="break">Break habit</option>
        </select>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Why this habit matters to me" className="w-full p-2 rounded-input bg-transparent border" />
      </div>
      <div className="flex flex-wrap gap-2">
        {colorSwatches.map(swatch => (
          <button key={swatch} type="button" onClick={()=>setColor(swatch)} className="w-7 h-7 rounded-full border" style={{background: swatch, outline: color===swatch ? '2px solid white' : 'none'}} />
        ))}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-accent rounded-btn text-white">Add Habit</button>
      </div>
    </form>
  )
}
