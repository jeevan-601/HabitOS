import React from 'react'

export default function FAB({onClick=(()=>{})}){
  return (
    <button onClick={onClick} className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white shadow-lg md:hidden">+</button>
  )
}
