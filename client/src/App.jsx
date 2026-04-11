import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import RoomLayout from './pages/RoomLayout'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [roomCode, setRoomCode] = useState(null)
  const [isCreator, setIsCreator] = useState(false)

  const handleCreateRoom = () => {
    // Mark as creator - RoomLayout will create the room via WebSocket
    setIsCreator(true)
    setRoomCode(null) // Will be set by server response
    setCurrentPage('room')
  }

  const handleJoinRoom = (code) => {
    setIsCreator(false)
    setRoomCode(code)
    setCurrentPage('room')
  }

  const handleLeaveRoom = () => {
    setRoomCode(null)
    setIsCreator(false)
    setCurrentPage('landing')
  }

  if (currentPage === 'landing') {
    return <LandingPage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
  }

  if (currentPage === 'room') {
    return <RoomLayout roomCode={roomCode} isCreator={isCreator} setRoomCode={setRoomCode} onLeaveRoom={handleLeaveRoom} />
  }

  return <LandingPage onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
}
