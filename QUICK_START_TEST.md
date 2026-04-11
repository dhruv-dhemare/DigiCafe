# Quick Start - Testing in 5 Minutes

## Step 1: Start Backend (Terminal 1)
```bash
cd d:\Projects\WEBRTC\server
npm run dev
```
**Expected:** `✓ Server running on http://localhost:3000`

## Step 2: Start Frontend (Terminal 2)
```bash
cd d:\Projects\WEBRTC\client
npm run dev
```
**Expected:** `Port 5173` (or next available port)

## Step 3: Open Two Browser Tabs/Windows

**Tab 1 (Peer A):** http://localhost:5173
**Tab 2 (Peer B):** http://localhost:5173

(Or different browsers: Chrome + Firefox on same computer)

---

## Quick Test Flow

### 1️⃣ Create Room (Tab 1)
- Click "Create Room" button
- Copy the room code shown

### 2️⃣ Join Room (Tab 2)
- Paste room code
- Click "Join Room"
- Both should show "Connected"

### 3️⃣ Test Video (Both Tabs)
- Click on "Video Call" tab
- Click "Start" button
- **Allow camera/microphone** when browser asks
- Should see each other's video within 2-3 seconds

### 4️⃣ Test Chat (Both Tabs)
- Click on "Chat" tab
- Type and send messages back-and-forth
- Should appear instantly

### 5️⃣ Test Files (Both Tabs)
- Click on "Files" tab
- Drag a file to drop zone (or click to browse)
- Should see progress bar
- Other peer receives file automatically
- Click download button to save

### 6️⃣ Test Mic/Camera Controls
- In Video Call tab, click icons to toggle on/off
- Microphone 🎤 = toggle audio
- Camera 📹 = toggle video
- Red X = stop call

---

## What to Look For

✅ **Success Indicators:**
- [ ] Room code 9 characters (like: ABC123XYZ)
- [ ] Status shows "Connected"
- [ ] Video appears in both tabs (2-3 sec delay)
- [ ] Chat messages appear instantly
- [ ] Files transfer with progress bar
- [ ] No errors in browser console (F12 > Console)

❌ **Failure Indicators:**
- [ ] Black video with "Waiting for peer..." after 10 seconds
- [ ] Chat messages don't appear
- [ ] Server console shows "ERROR"
- [ ] "Failed to join room" message

---

## If Something Fails

1. **Check Server Console Output**
   - Should show connection events
   - Look for "ERROR" messages

2. **Check Browser Console (F12)**
   - Tab 1: Press F12 > Console tab
   - Look for "ERROR" or red messages
   - Green/blue logs with emoji are normal (✓, 🔌, 📤, etc.)

3. **Restart Everything**
   ```bash
   # Stop both terminals (Ctrl+C)
   # Kill any hanging processes:
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   
   # Start fresh:
   npm run dev  # in both folders
   ```

4. **Most Common Issues:**
   - **Port 3000 already in use:** Kill node processes first
   - **Port 5173 taken:** Vite will suggest next port automatically
   - **"Allow camera" dialog:** Browser might ask - click "Allow"
   - **Camera shows black:** Might need permission change in system settings

---

## Video Call Tips

- **Needs real camera:** Test on a laptop/PC with camera
- **Privacy:** Only you and peer see video (P2P encrypted)
- **Bandwidth:** Works on 4G/DSL, requires stable connection
- **Audio:** Mic needs to be working for peer to hear you

---

## File Transfer Tips

- **Size:** Works with files from 1 byte to 2GB
- **Speed:** Depends on your internet, shows real-time speed
- **Simultaneous:** Can send/receive files at same time
- **Resume:** No resume on disconnect (restart transfer)

---

## Test All 16 Steps

This app implements all 16 steps from the roadmap:

| Step | Feature | Test |
|------|---------|------|
| 1-6 | Infrastructure | ✓ See room code + connection |
| 7 | Video Streaming | ✓ See each other on video |
| 8 | ICE Candidates | ✓ Works through any network |
| 9 | Data Channel | ✓ Chat & Files are instant |
| 10 | File Sharing | ✓ Drag file, peer gets it |
| 11 | Messaging | ✓ Real-time chat |
| 12 | Video Calling | ✓ Full video/audio call |
| 13 | UI Polish | ✓ Progress bars, status display |
| 14 | Database | ✓ (Backend only, not visible) |
| 15 | JWT Auth | ✓ (Backend token tracking) |
| 16 | Stability | ✓ Reconnects, error handling |

---

## Expected Performance

| Operation | Expected Time | Actual |
|-----------|---|---|
| Room creation | <100ms | --- |
| Peer joining | 1-2 sec | --- |
| Video appearing | 2-3 sec (RTCPeerConnection time) | --- |
| Chat message | <100ms (P2P, instant) | --- |
| File transfer start | <500ms showing progress | --- |
| Small file (1MB) | 1-5 sec | --- |

---

## Success! 🎉

If all 6 tests passed:
- **Core functionality works**
- **P2P connection established**
- **All 16 features operational**
- **Ready for deployment**

---

**Need help?** Check the detailed testing guide: `MANUAL_TESTING_GUIDE.md`
