const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../db')

function io(req){
  return req.app.get('io')
}

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',
    [req.user.id]
  )
  res.json(result.rows)
})

router.post('/', auth, async (req, res) => {
  const { title, body = '', meta = {} } = req.body || {}
  const result = await pool.query(
    'INSERT INTO notifications(user_id, title, body, meta) VALUES($1,$2,$3,$4) RETURNING *',
    [req.user.id, title, body, meta]
  )
  const notification = result.rows[0]
  io(req)?.to(`user:${req.user.id}`).emit('notification:new', notification)
  res.json(notification)
})

router.patch('/:id/read', auth, async (req, res) => {
  const result = await pool.query(
    'UPDATE notifications SET read_at=now() WHERE id=$1 AND user_id=$2 RETURNING *',
    [req.params.id, req.user.id]
  )
  const notification = result.rows[0]
  if(notification){
    io(req)?.to(`user:${req.user.id}`).emit('notification:read', notification)
  }
  res.json(notification || { ok: true })
})

router.post('/read-all', auth, async (req, res) => {
  await pool.query('UPDATE notifications SET read_at=now() WHERE user_id=$1 AND read_at IS NULL', [req.user.id])
  io(req)?.to(`user:${req.user.id}`).emit('notification:read-all', { userId: req.user.id })
  res.json({ ok: true })
})

module.exports = router
