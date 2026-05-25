const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')

function signAccessToken(user){
  return jwt.sign({id:user.id,email:user.email}, process.env.JWT_SECRET, { expiresIn: '15m' })
}

function signRefreshToken(user){
  return jwt.sign({id:user.id,email:user.email,type:'refresh'}, process.env.JWT_SECRET, { expiresIn: '30d' })
}

async function persistRefreshToken(userId, token){
  const tokenHash = await bcrypt.hash(token, 8)
  await pool.query(
    'INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES($1,$2, now() + interval \'30 days\')',
    [userId, tokenHash]
  )
}

router.post('/register', async (req, res)=>{
  const { email, password, name } = req.body
  if(!email || !password) return res.status(400).json({error:'missing'})
  const hashed = await bcrypt.hash(password, 10)
  try{
    const r = await pool.query('INSERT INTO users(email,password,name) VALUES($1,$2,$3) RETURNING id,email,name', [email, hashed, name||null])
    const user = r.rows[0]
    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    await persistRefreshToken(user.id, refreshToken)
    res.json({user, accessToken, refreshToken})
  }catch(e){
    res.status(400).json({error:e.message})
  }
})

router.post('/login', async (req,res)=>{
  const { email, password } = req.body
  if(!email || !password) return res.status(400).json({error:'missing'})
  const r = await pool.query('SELECT id,email,password,name FROM users WHERE email=$1', [email])
  const user = r.rows[0]
  if(!user) return res.status(400).json({error:'invalid'})
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(400).json({error:'invalid'})
  const safeUser = {id:user.id,email:user.email,name:user.name}
  const accessToken = signAccessToken(safeUser)
  const refreshToken = signRefreshToken(safeUser)
  await persistRefreshToken(user.id, refreshToken)
  res.json({user:safeUser, accessToken, refreshToken})
})

router.post('/refresh', async (req,res)=>{
  const { refreshToken } = req.body
  if(!refreshToken) return res.status(400).json({error:'missing'})
  try{
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET)
    if(payload.type !== 'refresh') return res.status(400).json({error:'invalid'})
    const r = await pool.query('SELECT id,email,name FROM users WHERE id=$1', [payload.id])
    const user = r.rows[0]
    if(!user) return res.status(400).json({error:'invalid'})
    const tokens = await pool.query('SELECT id, token_hash, revoked_at FROM refresh_tokens WHERE user_id=$1 AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 20', [user.id])
    const match = await Promise.all(tokens.rows.map(async row => ({ row, ok: await bcrypt.compare(refreshToken, row.token_hash) })))
    const found = match.find(x => x.ok)
    if(!found) return res.status(401).json({error:'invalid'})
    const accessToken = signAccessToken(user)
    res.json({user, accessToken})
  }catch(e){
    res.status(401).json({error:'invalid'})
  }
})

router.post('/logout', async (req,res)=>{
  const { refreshToken } = req.body
  if(!refreshToken) return res.json({ok:true})
  try{
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET)
    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id=$1 AND revoked_at IS NULL', [payload.id])
  }catch(e){}
  res.json({ok:true})
})

module.exports = router
