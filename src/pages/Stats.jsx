import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const sample = [
  {name:'Mon', v:2}, {name:'Tue', v:3}, {name:'Wed', v:1}, {name:'Thu', v:4}, {name:'Fri', v:2}, {name:'Sat', v:0}, {name:'Sun', v:1}
]

export default function Stats(){
  return (
    <div>
      <h2 className="text-2xl font-heading mb-4">Stats</h2>
      <div className="card p-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sample}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="v" fill="#7C3AED" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
