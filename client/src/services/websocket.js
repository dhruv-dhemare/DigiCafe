// WebSocket Service - Manages connection to signaling server
class WebSocketService {
  constructor() {
    this.ws = null
    this.url = `ws://${window.location.hostname}:3000`
    this.listeners = {}
    this.messageQueue = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  // Connect to WebSocket server
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('✓ WebSocket connected')
          this.reconnectAttempts = 0
          this.flushMessageQueue()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          console.log('📨 Message received:', message.type)
          this.emit(message.type, message.payload)
        }

        this.ws.onerror = (error) => {
          console.error('✗ WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('✗ WebSocket disconnected')
          this.emit('disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  // Send message to server
  send(type, payload = {}) {
    const message = JSON.stringify({ type, payload })

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', type)
      this.ws.send(message)
    } else {
      console.warn('WebSocket not connected, queuing message:', type)
      this.messageQueue.push(message)
    }
  }

  // Flush queued messages
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      this.ws.send(message)
    }
  }

  // Subscribe to message types
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    this.listeners[type].push(callback)
  }

  // Unsubscribe from message types
  off(type, callback) {
    if (!this.listeners[type]) return
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback)
  }

  // Emit event to listeners
  emit(type, data) {
    if (!this.listeners[type]) return
    this.listeners[type].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in listener for ${type}:`, error)
      }
    })
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect().catch(() => {}), this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed')
    }
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Check if connected
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Get connection status
  getStatus() {
    if (!this.ws) return 'disconnected'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }
}

// Export singleton instance
export default new WebSocketService()
