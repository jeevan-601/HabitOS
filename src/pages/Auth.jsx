import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Auth(){
  const login = useStore(s => s.login)
  const register = useStore(s => s.register)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const payload = { email, password, name }
      if(mode === 'login') await login(payload)
      else await register(payload)
    }catch(err){
      setError(err.message || 'Auth failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-heading">HabitOS</h1>
          <p className="text-sm text-muted">Sign in to sync habits across your devices.</p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-btn ${mode === 'login' ? 'bg-accent text-white' : 'border'}`}>Login</button>
          <button type="button" onClick={() => setMode('register')} className={`flex-1 py-2 rounded-btn ${mode === 'register' ? 'bg-accent text-white' : 'border'}`}>Register</button>
        </div>

        {mode === 'register' && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" className="w-full p-3 rounded-input bg-transparent border" />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-input bg-transparent border" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-input bg-transparent border" />

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <button disabled={loading} type="submit" className="w-full py-3 bg-accent rounded-btn text-white disabled:opacity-50">
          {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
