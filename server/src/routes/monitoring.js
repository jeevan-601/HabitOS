const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../db')
const { recordTelemetry, telemetrySummary } = require('../monitoring')

router.get('/summary', auth, async (req, res, next) => {
  try{
    const days = Math.max(1, Math.min(30, Number(req.query.days || 7)))
    const summary = await telemetrySummary(pool, req.user.id, days)
    res.json(summary)
  }catch(error){
    next(error)
  }
})

router.post('/events', auth, async (req, res, next) => {
  try{
    const event = await recordTelemetry(pool, {
      userId: req.user.id,
      type: req.body.type || 'event',
      name: req.body.name || 'unnamed',
      level: req.body.level || 'info',
      source: req.body.source || 'client',
      details: req.body.details || {}
    })
    res.status(201).json(event)
  }catch(error){
    next(error)
  }
})

router.post('/errors', auth, async (req, res, next) => {
  try{
    const event = await recordTelemetry(pool, {
      userId: req.user.id,
      type: 'error',
      name: req.body.name || req.body.message || 'client_error',
      level: 'error',
      source: req.body.source || 'client',
      details: {
        message: req.body.message,
        stack: req.body.stack,
        context: req.body.context || {}
      }
    })
    res.status(201).json(event)
  }catch(error){
    next(error)
  }
})

module.exports = router
