import { io } from 'socket.io-client'
import { API_BASE, getTokens } from './api'

let socket

export function getSocket(){
  if(socket) return socket
  const { accessToken } = getTokens()
  socket = io(API_BASE, { transports: ['websocket'], query: { token: accessToken } })
  return socket
}

export function resetSocket(){
  if(socket){
    socket.disconnect()
    socket = null
  }
}
