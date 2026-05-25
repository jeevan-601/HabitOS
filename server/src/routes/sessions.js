const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../db')

function io(req){
  return req.app.get('io')
}

async function createNotification(req, title, body, meta = {}){
  await pool.query(
    'INSERT INTO notifications(user_id, title, body, meta) VALUES($1,$2,$3,$4)',
    [req.user.id, title, body, meta]
  )
  io(req)?.to(`user:${req.user.id}`).emit('notification:new', { title, body, meta })
}

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM focus_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',
    [req.user.id]
  )
  res.json(result.rows)
})

router.post('/', auth, async (req, res) => {
  const {
    habitId = null,
    task = '',
    durationMinutes = 25,
    startedAt = null,
    endedAt = null,
    meta = {}
  } = req.body || {}

  const result = await pool.query(
    `INSERT INTO focus_sessions(user_id, habit_id, task, duration_minutes, started_at, ended_at, meta)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [req.user.id, habitId, task, durationMinutes, startedAt, endedAt, meta]
  )

  const session = result.rows[0]
  io(req)?.to(`user:${req.user.id}`).emit('session:created', session)
  await createNotification(req, 'Focus session logged', `${durationMinutes} minutes focused on ${task || 'a task'}.`, { type: 'session-created', sessionId: session.id })
  res.json(session)
})

module.exports = router
