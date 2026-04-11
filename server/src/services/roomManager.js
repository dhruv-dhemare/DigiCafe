// Room Manager - Handles room creation, joining, and client tracking
class RoomManager {
  constructor() {
    this.rooms = new Map() // roomId -> { clients: Set, createdAt }
    this.userRooms = new Map() // wsClient -> roomId
  }

  // Generate unique room ID
  generateRoomId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  // Create a new room
  createRoom() {
    const roomId = this.generateRoomId()
    this.rooms.set(roomId, {
      clients: new Set(),
      createdAt: Date.now(),
      peerId: null // Will store first client's peer ID
    })
    console.log(`🏠 Room created: ${roomId}`)
    return roomId
  }

  // Join a room
  joinRoom(roomId, ws) {
    if (!this.rooms.has(roomId)) {
      console.warn(`Room not found: ${roomId}`)
      return false
    }

    const room = this.rooms.get(roomId)
    
    // Check if room is full (max 2 peers for WebRTC)
    if (room.clients.size >= 2) {
      console.warn(`Room full: ${roomId}`)
      return false
    }

    room.clients.add(ws)
    this.userRooms.set(ws, roomId)
    console.log(`👥 Client joined room ${roomId} (now has ${room.clients.size} client(s))`)
    
    return true
  }

  // Leave a room
  leaveRoom(ws) {
    const roomId = this.userRooms.get(ws)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (room) {
      room.clients.delete(ws)
      console.log(`👤 Client left room ${roomId} (${room.clients.size} remaining)`)

      // Delete room if empty
      if (room.clients.size === 0) {
        this.rooms.delete(roomId)
        console.log(`🗑️ Room deleted: ${roomId}`)
      }
    }

    this.userRooms.delete(ws)
    return roomId
  }

  // Get room info
  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  // Get clients in a room
  getClients(roomId) {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room.clients) : []
  }

  // Get room ID for a client
  getRoomId(ws) {
    return this.userRooms.get(ws)
  }

  // Broadcast to all clients in a room
  broadcast(roomId, message, excludeWs = null) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const msgString = JSON.stringify(message)
    room.clients.forEach(client => {
      if (excludeWs && client === excludeWs) return
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(msgString)
      }
    })
  }

  // Send to specific client in room
  send(roomId, message, targetWs) {
    const room = this.rooms.get(roomId)
    if (!room || !room.clients.has(targetWs)) return

    if (targetWs.readyState === 1) {
      targetWs.send(JSON.stringify(message))
    }
  }

  // Get room stats
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalClients: this.userRooms.size,
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        clients: room.clients.size,
        createdAt: new Date(room.createdAt).toISOString()
      }))
    }
  }
}

export default new RoomManager()
