const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../db')

function getIO(req){
  return req.app.get('io')
}

async function createNotification(req, title, body, meta = {}){
  await pool.query(
    'INSERT INTO notifications(user_id, title, body, meta) VALUES($1,$2,$3,$4)',
    [req.user.id, title, body, meta]
  )
  getIO(req)?.to(`user:${req.user.id}`).emit('notification:new', { title, body, meta })
}

// Get all habits for current user
router.get('/', auth, async (req,res)=>{
  const r = await pool.query('SELECT * FROM habits WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
  res.json(r.rows)
})

router.post('/', auth, async (req,res)=>{
  const { name, description, ...rest } = req.body
  const meta = rest.meta || rest
  const r = await pool.query('INSERT INTO habits(user_id,name,description,meta) VALUES($1,$2,$3,$4) RETURNING *', [req.user.id,name,description||null, meta||{}])
  const habit = r.rows[0]
  getIO(req)?.to(`user:${req.user.id}`).emit('habit:created', habit)
  res.json(habit)
})

router.put('/:id', auth, async (req,res)=>{
  const id = req.params.id
  const { name, description, ...rest } = req.body
  const meta = rest.meta || rest
  const r = await pool.query('UPDATE habits SET name=$1, description=$2, meta=$3, updated_at=now() WHERE id=$4 AND user_id=$5 RETURNING *', [name,description,meta,id,req.user.id])
  const habit = r.rows[0]
  if(rest.completed === true){
    await pool.query(
      'INSERT INTO habit_logs(habit_id, user_id, meta) VALUES($1,$2,$3)',
      [id, req.user.id, { type: 'completed', difficulty: meta?.difficulty || 'medium' }]
    )
    await createNotification(req, 'Habit completed', `${name} was marked complete.`, { type: 'habit-completed', habitId: Number(id) })
  }
  getIO(req)?.to(`user:${req.user.id}`).emit('habit:updated', habit)
  res.json(habit)
})

router.delete('/:id', auth, async (req,res)=>{
  const id = req.params.id
  await pool.query('DELETE FROM habits WHERE id=$1 AND user_id=$2', [id, req.user.id])
  getIO(req)?.to(`user:${req.user.id}`).emit('habit:deleted', { id: Number(id) })
  res.json({ok:true})
})

module.exports = router
