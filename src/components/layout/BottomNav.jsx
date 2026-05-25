import React from 'react'
import { Link } from 'react-router-dom'

export default function BottomNav(){
  return (
    <nav className="fixed bottom-4 left-0 right-0 md:hidden flex justify-around px-4">
      <Link to="/">Home</Link>
      <Link to="/habits">Habits</Link>
      <Link to="/focus">Focus</Link>
      <Link to="/stats">Stats</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  )
}
