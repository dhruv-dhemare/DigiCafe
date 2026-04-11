# Manual Testing Guide - WebRTC File Sharing & Video Calling

This guide walks you through testing all features of the WebRTC application.

## Pre-Testing Setup

### 1. Start the Backend Server
```bash
cd d:\Projects\WEBRTC\server
npm install          # Only needed first time
npm run dev          # Or: node src/index.js
```

Expected output:
```
✓ Server running on http://localhost:3000
✓ WebSocket server ready on ws://localhost:3000
```

### 2. Start the Frontend (in a new terminal)
```bash
cd d:\Projects\WEBRTC\client
npm install          # Only needed first time
npm run dev          # Runs Vite dev server on port 5173
```

Expected output:
```
Port 5173 is in use, trying another one
Port 5174 is in use, trying another one
Port 5175 is in use...
```

Or access at: `http://localhost:5173`

### 3. Open Browser Windows
- **Browser 1 (Peer A)**: `http://localhost:5173`
- **Browser 2 (Peer B)**: `http://localhost:5173` (or same link in different tab)

Or use different browsers:
- Chrome on one desktop
- Firefox/Edge on another desktop or virtual machine

---

## Test Suite

### ✅ TEST 1: Room Creation & Joining

**Peer A (Creator):**
1. Click "Create Room" button
2. **Verify:**
   - Page shows unique room code (9 characters, alphanumeric)
   - Status shows "Connected (Waiting for peer...)"
   - Room code is displayed in sidebar
   - Copy button copies room code to clipboard

**Peer B (Joiner):**
1. Paste room code into "Join Room" input
2. Click "Join Room" button
3. **Verify:**
   - Connected to same room
   - Both peers see "Connected" status
   - Room code matches in both browsers

**Expected Results:**
- ✓ Unique room created
- ✓ Both peers in same room
- ✓ Connection established event triggered
- ✓ WebSocket connection active on both sides

---

### ✅ TEST 2: WebRTC Connection Establishment

**Both Peers Connected:**
1. Wait 2-3 seconds after peer B joins
2. Check browser console (F12 > Console tab)
3. **Look for these logs:**

```
🔌 Initializing peer connection...
📤 Offer generated
📥 Answer received
❄️ ICE candidates gathered
✓ Peer connection established
```

**Expected Results:**
- ✓ Offer/Answer exchange completes
- ✓ ICE candidates exchanged
- ✓ Connection state = "connected"
- ✓ No console errors

---

### ✅ TEST 3: Video Call Testing

#### Enable Local Camera/Microphone

**Peer A:**
1. Go to "Video Call" tab
2. Click "Start" button
3. **Browser will ask for camera/mic permission** → Click "Allow"
4. **Verify:**
   - Local video preview appears in bottom-right corner
   - Microphone icon shows 🎤 (enabled)
   - Camera icon shows 📹 (enabled)
   - Shows "Waiting for peer video..."

**Peer B:**
1. Go to "Video Call" tab  
2. Click "Start" button
3. **Your camera permission request appears** → Click "Allow"
4. **Verify:**
   - Local video preview appears in bottom-right corner
   - **Peer A's video now appears in main area** (if camera is on Peer B's device)
   - **Peer B sees Peer A's video in main area**

#### Test Audio/Video Controls

**Peer A (with video running):**
1. Click microphone icon (🎤) to toggle audio
2. **Verify:** Icon changes appearance
3. Click camera icon (📹) to toggle video
4. **Verify:** Local video feed freezes or shows last frame
5. Click red X (Stop) to end call
6. **Verify:** Video elements disappear, controls reset

**Repeat for Peer B**

**Expected Results:**
- ✓ Video streams display on both sides
- ✓ Audio/video toggles work
- ✓ Graceful disconnect
- ✓ No frozen UI

---

### ✅ TEST 4: Chat Messages

**Peer A sends message:**
1. Go to "Chat" tab
2. Type: `"Hello from Peer A"`
3. Press Enter or click Send
4. **Verify in Peer A's browser:**
   - Message appears with timestamp
   - Shows as "You" 
   - Message displays in chat history

**Both Peers:**
5. Check Peer B's browser
6. **Verify:**
   - Message appears with timestamp
   - Shows sender as "peer"
   - No delay (P2P via data channel)

**Peer B responds:**
7. Type: `"Hello from Peer B"`
8. Send message
9. **Verify in Peer A's browser:**
   - Peer B's message appears
   - Shows as "peer"
   - Conversation flows naturally

**Send Multiple Messages:**
10. Each peer sends 3-5 messages back-and-forth
11. **Verify:**
    - Auto-scroll to latest message
    - All messages appear in order
    - Timestamps accurate
    - No missing messages

**Expected Results:**
- ✓ P2P chat via data channel
- ✓ Messages display immediately
- ✓ Sender/receiver differentiation
- ✓ Chat history maintained
- ✓ Works while video/files active

---

### ✅ TEST 5: File Sharing

#### Test 1: Small File Transfer (1-5 MB)

**Peer A sends file to Peer B:**
1. Go to "Files" tab
2. Click in drop zone or drag-and-drop a small file (PDF, image, document)
3. **Verify in Peer A's browser:**
   - File appears in list
   - Progress bar shows 0-100%
   - Status: "uploading" → "complete"
   - Shows file name and transfer time

**Verify in Peer B's browser:**
4. File automatically appears in "Files" tab
5. Shows progress indicator
6. Status changes to "complete"
7. Download button appears

**Download Received File:**
8. Peer B clicks download button
9. **Verify:**
   - File downloads to Downloads folder
   - Filename matches original
   - File integrity check: Open downloaded file and verify it matches original

#### Test 2: Multiple Files

10. Peer A selects 2-3 files at once
11. **Verify:**
    - All files appear with separate progress bars
    - Each uploads independently
    - Total progress visible
    - No interference between transfers

#### Test 3: Large File (50+ MB)
12. Drag a large video or archive file
13. **Verify:**
    - Transfer completes without disconnect
    - Progress smooth and continuous
    - No UI freezing
    - Peer B can download successfully

#### Test 4: Bidirectional Transfer
14. Peer A sends file to Peer B
15. **While that's downloading**, Peer B sends file to Peer A simultaneously
16. **Verify:**
    - Both transfers proceed without interference
    - Both complete successfully
    - Both get both files

**Expected Results:**
- ✓ File chunking (64KB chunks) works
- ✓ Progress tracking accurate
- ✓ Files received intact
- ✓ Download functionality works
- ✓ Handles multiple files
- ✓ Supports large files
- ✓ Bidirectional transfers possible

---

### ✅ TEST 6: Data Channel Status

**During active video call:**
1. Open browser console (F12)
2. Toggle video/chat/files active
3. **Check logs for:**
   ```
   📢 Data channel opened
   📤 Data channel message sent
   📥 Data channel message received
   ```

**When Peer Disconnects:**
4. Close one browser tab
5. **In remaining peer's console, verify:**
   ```
   📢 Data channel closed
   peer_left event triggered
   ```

---

### ✅ TEST 7: Connection State Monitoring

**Throughout Testing:**
1. Check sidebar for "Connection Status"
2. **Should show states:**
   - "Connecting..." (initial)
   - "Connected" (after peer join)
   - "Connected (Waiting for peer...)" (if alone)
   - Current room code always visible

**Expected Results:**
- ✓ Status updates in real-time
- ✓ Room code persistently displayed
- ✓ Peer count shown

---

### ✅ TEST 8: Error Handling

#### Scenario A: Invalid Room Code
1. Peer enters wrong room code
2. Click "Join"
3. **Verify:**
   - Error message displays
   - States: "Failed to join room. Room not found or full."
   - Cannot join

#### Scenario B: Connection Lost
1. Start video call
2. Unplug network cable or turn off WiFi on one peer
3. Wait 5 seconds
4. **Verify:**
   - Status changes to error/disconnected
   - Auto-reconnect attempts (with exponential backoff)
   - Messages queue until reconnected
5. Restore network
6. **Verify:**
   - Auto-reconnects
   - Queued messages send
   - Video attempts to re-establish

#### Scenario C: Peer Disconnects
1. Video call active with both peers
2. Close browser tab on Peer B
3. **Verify in Peer A:**
   - Status shows peer left
   - Video element disappears gracefully
   - Chat still works if reconnecting
   - Can send new chat message

#### Scenario D: Camera Permission Denied
1. Try to start video
2. Deny camera permission when browser asks
3. **Verify:**
   - Graceful error handling
   - No console errors
   - UI remains responsive
   - Can still use chat/files

**Expected Results:**
- ✓ Invalid room handled
- ✓ Network errors handled
- ✓ Graceful disconnect
- ✓ Permission denial handled
- ✓ Users informed of issues

---

### ✅ TEST 9: Concurrent Operations

**Peer A:**
1. Start video call (both peers enabled)
2. Immediately go to Chat tab
3. Send: "Testing concurrent ops"

**While message sending:**
4. Go to Files tab
5. Drag and drop a file

**Peer B:**
6. Simultaneously send a chat message
7. Drag another file

**Verify All Three Channels Active:**
- ✓ Video streams continue uninterrupted
- ✓ Chat message delivered
- ✓ Both files transfer simultaneously
- ✓ Data channel handles multiplexing
- ✓ No performance degradation

---

### ✅ TEST 10: Browser Compatibility

**Test on Multiple Browsers:**

| Browser | Video | Audio | Chat | Files | Notes |
|---------|-------|-------|------|-------|-------|
| Chrome  |   ✓   |   ✓   |  ✓   |   ✓   | Primary target |
| Firefox |   ✓   |   ✓   |  ✓   |   ✓   | Should work |
| Edge    |   ✓   |   ✓   |  ✓   |   ✓   | Chromium-based |
| Safari  |   ?   |   ?   |  ✓   |   ✓   | Needs testing |

**For Each Browser:**
1. Complete tests 1-6
2. Note any issues
3. Check console for errors

---

### ✅ TEST 11: Edge Cases

#### Empty Chat Send
1. Go to Chat
2. Click Send with empty input
3. **Verify:** No empty message sends

#### Large Message
1. Copy a full Wikipedia article
2. Paste into chat
3. Send
4. **Verify:** Handles large strings without breaking

#### Rapid File Clicks
1. Drop multiple files very quickly
2. **Verify:** No crashes, queues properly

#### Leave & Rejoin
1. Peer B closes browser
2. Waits 10 seconds
3. Reopens app and joins same room
4. **Verify:** Rejoins successfully, new connection established

#### Multiple Rooms
1. Open 3 browser tabs/windows
2. Tab 1 & 2: Create and join Room A
3. Tab 3: Create Room B
4. **Verify:** 
   - Tab 3 isolated to Room B
   - Tab 1 & 2 still in Room A
   - No crosstalk

---

## Console Logs to Expect

### Successful Connection
```
🔌 Initializing peer connection...
📤 Offer generated
📥 Answer received
❄️ ICE candidates gathered
✓ Peer connection established
📢 Data channel opened
```

### File Transfer
```
📤 Sending file: myfile.pdf (2097152 bytes, 33 chunks)
📬 Flushing 5 queued ICE candidates
✓ File sent: myfile.pdf
📥 Receiving file: myfile.pdf
📥 File received: myfile.pdf
```

### Chat
```
📥 Data channel message: { type: 'chat_message_start', ... }
📤 Data channel message sent
```

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend client builds and loads
- [ ] Room creation displays unique code
- [ ] Peer joining works
- [ ] WebRTC connection established (check logs)
- [ ] Video preview displays locally
- [ ] Remote video displays on peer
- [ ] Audio toggle works
- [ ] Video toggle works
- [ ] Chat messages send & receive
- [ ] Files upload and download
- [ ] Progress bars show accurate progress
- [ ] Multiple files transfer simultaneously
- [ ] Large files (50+ MB) transfer completely
- [ ] Connection status displayed
- [ ] Error messages shown for invalid codes
- [ ] Graceful handling of disconnects
- [ ] Auto-reconnect attempts work
- [ ] Data channel status tracked
- [ ] Works across different browsers
- [ ] No console errors during normal use
- [ ] Responsive UI throughout

---

## Performance Metrics to Monitor

**During Testing, Open DevTools (F12):**

### Network Tab
- Check WebSocket messages flow smoothly
- No repeated connection attempts
- File transfer shows realistic speeds

### Performance Tab
- Record during video call
- CPU usage should be reasonable (<30% per peer)
- Memory should not continuously grow
- No memory leaks visible

### Console
- No "ERROR" messages (warnings ok)
- No repeated error messages
- ICE candidate processing smooth

---

## Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Failed to join room" | Room doesn't exist or full | Check room code, max 2 peers per room |
| Black video | Camera not initialized | Check browser permissions, camera device |
| No audio | Mic not enabled | Check browser permissions, system audio |
| Slow file transfer | Network congestion | Check internet speed, try smaller file |
| Chat not sending | Data channel not open | Wait for connection to establish |
| Connection drops repeatedly | Network unstable | Check WiFi signal, try wired connection |
| "Cannot find module" errors | Dependencies missing | Run `npm install` in server/client folders |

---

## Success Criteria

✅ **All features work as expected**
- Room creation & joining
- WebRTC P2P connection
- Video/audio streaming
- Real-time chat via data channel
- File transfer with progress
- Connection state management
- Error handling & recovery

✅ **Performance acceptable**
- Video smooth (no frequent buffering)
- Chat instant (<100ms latency)
- File transfer reasonable speed
- UI responsive (no freezing)

✅ **No critical errors**
- No unhandled exceptions
- Graceful error messages
- Auto-recovery from network issues
- Clean disconnect

---

## Next Steps After Testing

If all tests pass:
1. ✅ Create Git commit: "Complete WebRTC implementation - all 16 steps tested"
2. ✅ Deploy to staging environment for team testing
3. ✅ Gather user feedback
4. ✅ Document any issues found
5. ✅ Consider optimization based on performance metrics

If issues found:
1. 📝 Document exact steps to reproduce
2. 🔍 Check browser console logs
3. 🐛 Debug using provided server logs
4. 💻 Fix and re-test

---

## Debug Mode

**Enable detailed logging:**

In `client/src/services/websocket.js`, uncomment:
```javascript
console.log('📨 Sending:', message)
console.log('📥 Received:', data)
```

In `client/src/services/rtcPeer.js`, all logs are already enabled with emojis 🎯

In `server/src/index.js`, logs show:
- Connection events
- Room management
- Message relay
- Client count

---

**Happy Testing! 🚀**
