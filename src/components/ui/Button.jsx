import React from 'react'

export default function Button({children, className='', ...props}){
  return (
    <button className={`px-4 py-2 rounded-btn bg-accent text-white ${className}`} {...props}>{children}</button>
  )
}
