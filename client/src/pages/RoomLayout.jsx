import { useState, useRef, useEffect } from 'react'
import { Menu, X, Copy, MessageSquare, FileUp, Video, ArrowLeft, Check, Upload, File, Download, Mic, Camera } from 'lucide-react'
import Logo from '../components/Logo'
import '../styles/room.css'
import ws from '../services/websocket'
import rtcPeer from '../services/rtcPeer'

export default function RoomLayout({ roomCode, isCreator, setRoomCode, onLeaveRoom }) {
  const [activeTab, setActiveTab] = useState('chat')
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [dataChannelStatus, setDataChannelStatus] = useState('closed')
  
  // Track if we've already sent the create/join message to avoid duplicates
  const hasInitialized = useRef(false)

  // Connect to WebSocket on mount
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        setConnectionStatus('Connecting...')
        await ws.connect()
        
        // Create room if we're the creator, otherwise join (only once)
        if (!hasInitialized.current) {
          hasInitialized.current = true
          
          if (isCreator) {
            console.log('🏠 Creating room...')
            ws.send('create', {})
          } else if (roomCode) {
            console.log('👥 Joining room:', roomCode)
            ws.send('join', { roomId: roomCode })
          }
        }
        
        // Update status when connected
        ws.on('connected', () => {
          setConnectionStatus('Connected')
        })
        
        // Handle room creation
        ws.on('room_created', (data) => {
          console.log('🏠 Room created:', data.roomId)
          setRoomCode(data.roomId)
          setConnectionStatus('Connected (Waiting for peer...)')
        })
        
        // Handle join confirmation - Initialize as responder while waiting for offer
        ws.on('join_confirmed', (data) => {
          console.log('✓ Joined room:', data.roomId)
          console.log('👥 Initializing as responder, waiting for offer...')
          setConnectionStatus('Connected (Waiting for offer...)')
          rtcPeer.initializePeerConnection(false) // Initialize as responder now, before offer arrives
        })
        
        // When peer joins: Initialize WebRTC as initiator
        ws.on('peer_joined', (data) => {
          console.log('👥 Peer joined, initializing WebRTC as initiator...')
          setConnectionStatus('Negotiating...')
          // Only initialize if not already done
          if (!rtcPeer.peerConnection) {
            rtcPeer.initializePeerConnection(true) // We initiate the offer
          }
        })
        
        // Handle incoming offer
        ws.on('offer', (data) => {
          console.log('📤 Received offer from peer')
          rtcPeer.handleOffer(data.sdp)
        })
        
        // Handle incoming answer
        ws.on('answer', (data) => {
          console.log('📥 Received answer from peer')
          rtcPeer.handleAnswer(data.sdp)
        })
        
        // Handle incoming ICE candidate
        ws.on('ice_candidate', (data) => {
          console.log('❄️ Received ICE candidate from peer')
          rtcPeer.handleIceCandidate(data)
        })
        
        // Handle peer connection state changes
        rtcPeer.on('connected', () => {
          setConnectionStatus('P2P Connected ✓')
        })
        
        rtcPeer.on('connection_failed', () => {
          setConnectionStatus('P2P Connection Failed')
        })

        // Handle remote stream
        rtcPeer.on('remote_stream', (stream) => {
          console.log('🎥 Remote stream received')
          setRemoteStream(stream)
        })

        // Handle data channel
        rtcPeer.on('data_channel_open', () => {
          console.log('📢 Data channel opened')
          setDataChannelStatus('open')
        })

        rtcPeer.on('data_channel_close', () => {
          console.log('📢 Data channel closed')
          setDataChannelStatus('closed')
        })

        rtcPeer.on('data_channel_message', (message) => {
          console.log('📢 Received via data channel:', message)
        })
        
        rtcPeer.on('data_channel_error', (error) => {
          console.error('📢 Data channel error:', error)
        })
        
        // Handle disconnection
        ws.on('disconnected', () => {
          setConnectionStatus('Disconnected')
          rtcPeer.close()
        })
        
        ws.on('peer_left', () => {
          console.log('👋 Peer left')
          setConnectionStatus('Peer Disconnected')
          rtcPeer.close()
        })
        
        // Handle errors
        ws.on('error', (error) => {
          console.error('WebSocket error:', error)
          setConnectionStatus('Error')
        })
        
        ws.on('reconnect_failed', () => {
          setConnectionStatus('Connection failed')
        })
      } catch (error) {
        console.error('Failed to initialize:', error)
        setConnectionStatus('Connection failed')
      }
    }

    initWebSocket()

    // Cleanup on unmount
    return () => {
      rtcPeer.close()
      if (ws.isConnected()) {
        ws.disconnect()
      }
    }
  }, [])

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLeaveRoom = () => {
    if (onLeaveRoom) {
      onLeaveRoom()
    }
  }

  // Start local media stream
  const startLocalMedia = async () => {
    try {
      const constraints = {
        audio: true,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }
      const stream = await rtcPeer.getUserMedia(constraints)
      setLocalStream(stream)
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)

      // Add local stream to peer connection (handles renegotiation)
      if (rtcPeer.peerConnection && rtcPeer.peerConnection.connectionState !== 'closed') {
        console.log('🎥 Adding local stream to established peer connection')
        await rtcPeer.addLocalStream(stream) // This now calls renegotiateConnection()
      }
    } catch (error) {
      console.error('Failed to get user media:', error)
      alert('Failed to access camera/microphone. Please check permissions.')
    }
  }

  // Stop local media stream
  const stopLocalMedia = () => {
    if (localStream) {
      rtcPeer.stopLocalStream()
      setLocalStream(null)
      setIsAudioEnabled(false)
      setIsVideoEnabled(false)
    }
  }

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  // Send message via data channel
  const sendDataChannelMessage = (message) => {
    const result = rtcPeer.sendDataChannelMessage(message)
    console.log('📤 sendDataChannelMessage result:', result, 'dataChannel state:', rtcPeer.dataChannel?.readyState)
    return result
  }

  return (
    <div className="room-container">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`room-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <Logo variant="small" />
          <button 
            className="close-sidebar"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Room Info */}
        <div className="room-info">
          <div className="room-label">ROOM</div>
          <div className="room-code-display">
            <span className="room-code">{roomCode}</span>
            <button 
              className={`copy-btn ${isCopied ? 'copied' : ''}`}
              onClick={handleCopyRoomCode}
              aria-label="Copy room code"
              title="Copy room code"
            >
              {isCopied ? <Check size={20} style={{ color: 'green' }} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="connection-status">
          <span className="status-dot"></span>
          <span className="status-text">{connectionStatus}</span>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('chat')
              setIsSidebarOpen(false)
            }}
            aria-label="Chat tab"
          >
            <span className="tab-icon"><MessageSquare size={20} /></span>
            <span className="tab-label">Chat</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('files')
              setIsSidebarOpen(false)
            }}
            aria-label="Files tab"
          >
            <span className="tab-icon"><FileUp size={20} /></span>
            <span className="tab-label">Files</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('video')
              setIsSidebarOpen(false)
            }}
            aria-label="Video tab"
          >
            <span className="tab-icon"><Video size={20} /></span>
            <span className="tab-label">Video</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="leave-btn" onClick={handleLeaveRoom} aria-label="Leave room">
            <ArrowLeft size={20} /> Leave
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="room-main">
        <div className="room-content">
          {activeTab === 'chat' && <ChatView onSendMessage={sendDataChannelMessage} />}
          {activeTab === 'files' && <FilesView />}
          {activeTab === 'video' && (
            <VideoView 
              localStream={localStream}
              remoteStream={remoteStream}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              onStartMedia={startLocalMedia}
              onStopMedia={stopLocalMedia}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function ChatView({ onSendMessage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (data) => {
      console.log('📥 ChatView received message:', data)
      const text = typeof data === 'string' ? data : data.text
      const newMessage = {
        id: Date.now(),
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'peer'
      }
      console.log('📥 Adding peer message to chat:', newMessage)
      setMessages(prev => [...prev, newMessage])
    }

    // Listen via data channel
    rtcPeer.on('data_channel_text', handleMessage)

    return () => {
      rtcPeer.off('data_channel_text', handleMessage)
    }
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (input.trim()) {
      // Add message to local UI
      const newMessage = {
        id: Date.now(),
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'you'
      }
      setMessages(prev => [...prev, newMessage])
      
      // Send through data channel
      if (onSendMessage) {
        onSendMessage(input)
      } else {
        // Fallback to WebSocket if data channel not available
        ws.send('chat_message', { text: input })
      }
      setInput('')
    }
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>Chat</h2>
        <p className="chat-subtitle">Real-time peer messaging</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message input"
        />
        <button type="submit" className="send-btn" aria-label="Send message">
          <Check size={20} />
        </button>
      </form>
    </div>
  )
}

function FilesView() {
  const [sendingFiles, setSendingFiles] = useState({}) // fileId -> {name, progress, status}
  const [receivedFiles, setReceivedFiles] = useState([]) // {fileId, name, blob, downloadUrl}
  const fileInputRef = useRef(null)

  // Listen for file transfer events
  useEffect(() => {
    const handleFileSendProgress = (data) => {
      setSendingFiles(prev => ({
        ...prev,
        [data.fileId]: {
          name: data.fileName,
          progress: Math.round(data.progress),
          status: 'uploading'
        }
      }))
    }

    const handleFileSent = (data) => {
      setSendingFiles(prev => ({
        ...prev,
        [data.fileId]: {
          ...prev[data.fileId],
          status: 'complete',
          progress: 100
        }
      }))
    }

    const handleFileReceiveProgress = (data) => {
      setSendingFiles(prev => ({
        ...prev,
        [data.fileId]: {
          name: data.fileName,
          progress: Math.round(data.progress),
          status: 'downloading'
        }
      }))
    }

    const handleFileReceived = (data) => {
      const downloadUrl = URL.createObjectURL(data.blob)
      setReceivedFiles(prev => [...prev, {
        fileId: data.fileId,
        name: data.fileName,
        blob: data.blob,
        downloadUrl,
        status: 'complete'
      }])

      setSendingFiles(prev => {
        const updated = { ...prev }
        delete updated[data.fileId]
        return updated
      })
    }

    rtcPeer.on('file_send_progress', handleFileSendProgress)
    rtcPeer.on('file_sent', handleFileSent)
    rtcPeer.on('file_receive_progress', handleFileReceiveProgress)
    rtcPeer.on('file_received', handleFileReceived)

    return () => {
      rtcPeer.off('file_send_progress', handleFileSendProgress)
      rtcPeer.off('file_sent', handleFileSent)
      rtcPeer.off('file_receive_progress', handleFileReceiveProgress)
      rtcPeer.off('file_received', handleFileReceived)
    }
  }, [])

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return

    for (let file of files) {
      try {
        await rtcPeer.sendFile(file)
      } catch (error) {
        console.error('Error sending file:', error)
        setSendingFiles(prev => ({
          ...prev,
          [file.name]: {
            name: file.name,
            progress: 0,
            status: 'error'
          }
        }))
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    handleFileSelect(files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadFile = (file) => {
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const allFiles = [
    ...Object.entries(sendingFiles).map(([fileId, data]) => ({
      id: fileId,
      ...data,
      type: 'sending'
    })),
    ...receivedFiles.map(file => ({
      ...file,
      type: 'received'
    }))
  ]

  return (
    <div className="files-view">
      <div className="files-header">
        <h2>Files</h2>
        <p className="files-subtitle">Drag & drop or click to share</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Select files"
      />

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleBrowseClick}
      >
        <div className="drop-icon"><Upload size={32} /></div>
        <div className="drop-text">Drop files here</div>
        <div className="drop-subtext">or click to browse</div>
      </div>

      <div className="files-list">
        {allFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            No files yet
          </div>
        ) : (
          allFiles.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-icon"><File size={24} /></div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">
                  {file.progress}% · {file.status}
                </div>
                {file.progress < 100 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${file.progress}%`,
                        backgroundColor: file.type === 'receiving' ? '#4CAF50' : '#2196F3'
                      }}
                    ></div>
                  </div>
                )}
              </div>
              {file.type === 'received' && file.status === 'complete' && (
                <button
                  className="file-action"
                  onClick={() => downloadFile(file)}
                  title="Download file"
                >
                  <Download size={20} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function VideoView({
  localStream,
  remoteStream,
  isVideoEnabled,
  isAudioEnabled,
  onStartMedia,
  onStopMedia,
  onToggleAudio,
  onToggleVideo
}) {
  const remoteVideoRef = useRef(null)
  const localVideoRef = useRef(null)

  // Update video elements when streams change
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  return (
    <div className="video-view">
      <div className="video-header">
        <h2>Video Call</h2>
        <p className="video-subtitle">Peer-to-peer connection</p>
        {localStream && <p style={{ fontSize: '12px', color: '#888' }}>📹 Camera: {isVideoEnabled ? 'ON' : 'OFF'} | 🎤 Mic: {isAudioEnabled ? 'ON' : 'OFF'}</p>}
      </div>

      <div className="video-container">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', backgroundColor: '#000', borderRadius: '8px' }}
          />
        ) : (
          <div className="video-placeholder">
            <div className="video-icon"><Video size={48} /></div>
            <div className="video-status">{localStream ? 'Waiting for peer video...' : 'Start video to begin'}</div>
            <div className="video-info">Peer video will appear here</div>
          </div>
        )}

        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '150px',
              height: '150px',
              backgroundColor: '#000',
              borderRadius: '8px',
              border: '2px solid #00d4ff'
            }}
          />
        )}
      </div>

      <div className="video-controls">
        {!localStream ? (
          <button className="control-btn start-call" onClick={onStartMedia} aria-label="Start video">
            <Video size={20} /> Start
          </button>
        ) : (
          <>
            <button
              className={`control-btn ${isAudioEnabled ? 'microphone' : 'microphone-off'}`}
              onClick={onToggleAudio}
              aria-label="Toggle microphone"
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              <Mic size={20} />
            </button>
            <button
              className={`control-btn ${isVideoEnabled ? 'camera' : 'camera-off'}`}
              onClick={onToggleVideo}
              aria-label="Toggle camera"
              title={isVideoEnabled ? 'Stop video' : 'Start video'}
            >
              <Camera size={20} />
            </button>
            <button className="control-btn end-call" onClick={onStopMedia} aria-label="Stop call">
              <X size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
