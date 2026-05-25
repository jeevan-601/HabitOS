require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { init, pool } = require('./db')
const authRoutes = require('./routes/auth')
const habitsRoutes = require('./routes/habits')
const sessionsRoutes = require('./routes/sessions')
const gamificationRoutes = require('./routes/gamification')
const notificationsRoutes = require('./routes/notifications')
const monitoringRoutes = require('./routes/monitoring')
const { createRequestLogger } = require('./monitoring')
const { JWT_SECRET } = require('./config')

const app = express()
app.use(cors())
app.use(express.json())
app.use(createRequestLogger())

app.use('/auth', authRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/monitoring', monitoringRoutes)

const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { cors: { origin: '*' } })
app.set('io', io)

// very small presence mapping: userId -> set of socket ids
const presence = new Map()

io.on('connection', socket => {
  const { token } = socket.handshake.query || {}
  // try decode token for simple auth
  try{
    const jwt = require('jsonwebtoken')
    const payload = jwt.verify(token, JWT_SECRET)
    socket.user = payload
    const set = presence.get(payload.id) || new Set()
    set.add(socket.id)
    presence.set(payload.id, set)

    socket.join(`user:${payload.id}`)
  }catch(e){
    // unauthenticated socket; allow limited operations
  }

  socket.on('habit:updated', (data)=>{
    // broadcast to all sockets of the user
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('habit:updated', data)
    }
  })

  socket.on('habit:created', (data)=>{
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('habit:created', data)
    }
  })

  socket.on('habit:deleted', (data)=>{
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('habit:deleted', data)
    }
  })

  socket.on('session:created', (data)=>{
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('session:created', data)
    }
  })

  socket.on('notification:new', (data)=>{
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('notification:new', data)
    }
  })

  socket.on('notification:read', (data)=>{
    if(socket.user && socket.user.id){
      io.to(`user:${socket.user.id}`).emit('notification:read', data)
    }
  })

  socket.on('disconnect', ()=>{
    if(socket.user && socket.user.id){
      const set = presence.get(socket.user.id) || new Set()
      set.delete(socket.id)
      if(set.size) presence.set(socket.user.id, set)
      else presence.delete(socket.user.id)
    }
  })
})

const PORT = process.env.PORT || 4000

init().then(()=>{
  server.listen(PORT, ()=> console.log('Server listening on', PORT))
}).catch(err=>{ console.error('DB init failed', err); process.exit(1) })

// Serve frontend static files if built (so opening backend port can serve the SPA)
try{
  const fs = require('fs')
  const path = require('path')
  const distPath = path.resolve(__dirname, '../../dist')
  if(fs.existsSync(distPath)){
    console.log('Serving frontend from', distPath)
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }
}catch(e){
  console.warn('Frontend static serve setup skipped', e)
}

app.use((error, req, res, next) => {
  console.error('[error]', req.method, req.originalUrl, error)
  res.status(500).json({ error: 'Internal server error' })
})

process.on('unhandledRejection', reason => {
  console.error('[unhandledRejection]', reason)
})

process.on('uncaughtException', error => {
  console.error('[uncaughtException]', error)
})
