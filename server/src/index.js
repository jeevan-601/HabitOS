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

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/notifications', notificationsRoutes)

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
    const payload = jwt.verify(token, process.env.JWT_SECRET)
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
