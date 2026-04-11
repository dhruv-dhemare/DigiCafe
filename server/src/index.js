import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { config } from './config/index.js'
import { query as dbQuery } from './config/database.js'
import apiRoutes from './routes/index.js'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', apiRoutes)

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('✓ WebSocket client connected')
  let clientRoomId = null

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connected', 
    payload: { message: 'Connected to signaling server' } 
  }))

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      console.log(`📨 Received: ${message.type}`)

      switch (message.type) {
        case 'join':
          clientRoomId = message.payload.roomId
          console.log(`👤 Client joined room: ${clientRoomId}`)
          // Notify client of successful join
          ws.send(JSON.stringify({
            type: 'join_confirmed',
            payload: { roomId: clientRoomId, message: 'Successfully joined room' }
          }))
          break

        case 'create':
          clientRoomId = message.payload.roomId
          console.log(`🏠 Room created: ${clientRoomId}`)
          ws.send(JSON.stringify({
            type: 'room_created',
            payload: { roomId: clientRoomId, message: 'Room created successfully' }
          }))
          break

        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            payload: { timestamp: Date.now() }
          }))
          break

        default:
          console.log(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Server error processing message' }
      }))
    }
  })

  ws.on('close', () => {
    console.log('✗ WebSocket client disconnected')
    if (clientRoomId) {
      console.log(`👤 Client left room: ${clientRoomId}`)
    }
  })

  ws.on('error', (error) => {
    console.error('✗ WebSocket error:', error)
  })
})

// Start server
server.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
  console.log(`WebSocket server ready on ws://localhost:${config.port}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close()
})
