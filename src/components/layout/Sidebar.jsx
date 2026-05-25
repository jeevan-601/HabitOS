import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="w-20 md:w-64 p-4 hidden md:block">
      <div className="space-y-4">
        <NavLink to="/" className="block py-2">Dashboard</NavLink>
        <NavLink to="/habits" className="block py-2">Habits</NavLink>
        <NavLink to="/focus" className="block py-2">Focus</NavLink>
        <NavLink to="/stats" className="block py-2">Stats</NavLink>
        <NavLink to="/profile" className="block py-2">Profile</NavLink>
      </div>
    </aside>
  )
}
