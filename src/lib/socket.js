import { io } from 'socket.io-client'
import { API_BASE, getTokens } from './api'

let socket

export function getSocket(){
  if(socket) return socket
  const { accessToken } = getTokens()
  const origin = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '')
  socket = io(origin, {
    transports: ['websocket'],
    path: '/socket.io',
    query: { token: accessToken }
  })
  return socket
}

export function resetSocket(){
  if(socket){
    socket.disconnect()
    socket = null
  }
}
