# Multi-User WebRTC - Quick Start Testing Guide

## 🚀 Quick Setup

### 1. Start the Server
```bash
cd server
npm install  # if needed
npm start
```
Server runs on: `https://localhost:3000`

### 2. Start the Client (in another terminal)
```bash
cd client
npm install  # if needed
npm run dev
```
Client runs on: `http://localhost:5174` or `http://localhost:5173`

---

## 🧪 Testing Scenarios

### Scenario 1: Two Users (Basic Test)
1. **User 1**: 
   - Open browser #1: `http://localhost:5174`
   - Click "Create Room"
   - Enter name: "Alice"
   - Copy room code

2. **User 2**:
   - Open browser #2: `http://localhost:5174`
   - Click "Join Room"
   - Paste room code
   - Enter name: "Bob"

3. **Verify**:
   - ✅ Both see room code
   - ✅ User list shows Alice and Bob
   - ✅ Chat messages work (try sending message)
   - ✅ Start video - see each other
   - ✅ Names appear under videos

### Scenario 2: Three Users (Group Chat)
1. Follow scenario 1 setup
2. **User 3**:
   - Open browser #3
   - Join same room code
   - Enter name: "Charlie"

3. **Verify**:
   - ✅ Alice sees Bob and Charlie join
   - ✅ Bob sees Charlie join
   - ✅ All three see each other in video grid
   - ✅ All three see each other in user list (3/6)
   - ✅ Chat messages work for all
   - ✅ Each video labeled correctly

### Scenario 4: File Sharing
1. With 2+ users connected
2. Go to "Files" tab
3. Either:
   - Drag & drop a file, or
   - Click zone and select file

4. **Verify**:
   - ✅ Progress bar shows upload
   - ✅ Recipient sees file appear
   - ✅ File shows sender name

### Scenario 5: Responsive Design
1. Start with 3 users video call
2. **Desktop (1920px)**:
   - ✅ 3-column grid layout
   - ✅ All 3 videos visible
   - ✅ Sidebar always visible

3. **Tablet (768px)**:
   - ✅ 2-column grid layout
   - ✅ Sidebar auto-collapses
   - ✅ Click menu icon to toggle

4. **Mobile (375px)**:
   - ✅ 1-column video (full width)
   - ✅ Sidebar slides in/out
   - ✅ All controls accessible
   - ✅ Touch-friendly buttons

### Scenario 6: User Leaves
1. With 3 users: Alice, Bob, Charlie
2. Charlie leaves room (click Leave button)
3. **Verify**:
   - ✅ Alice sees "Charlie left the room"
   - ✅ Bob sees same notification
   - ✅ User list updates (2/6)
   - ✅ Charlie's video disappears

---

## 🐛 Debugging Tips

### Check Console (F12)
```
Expected messages:
✓ "WebSocket connected"
✓ "Room created: XXXX"
✓ "Joined room: XXXX"
✓ "👥 Initializing peer connection"
✓ "P2P Connected ✓"
✓ "Remote stream received"
✓ "Data channel opened"
```

### Common Issues

**Issue**: "Connection failed" status
- [ ] Check if server is running (`npm start` in /server)
- [ ] Verify port 3000 is not blocked
- [ ] Check browser console for CORS errors

**Issue**: Can see self but not peer video
- [ ] Wait 5-10 seconds for P2P connection
- [ ] Check both users have cameras enabled
- [ ] Verify browser has camera permission
- [ ] Check console for WebRTC errors

**Issue**: User list doesn't update
- [ ] Refresh page
- [ ] Check WebSocket status in console
- [ ] Close and rejoin room

**Issue**: Chat messages don't send
- [ ] Ensure you're in same room
- [ ] Check data channel status (should be "open")
- [ ] Refresh page and try again

**Issue**: Video grid layout broken
- [ ] Check responsive breakpoints
- [ ] Resize browser window
- [ ] Try different browser (Chrome recommended)

---

## 📊 What to Test

### Functionality
- [x] **Room Creation**: Creates unique codes
- [x] **Room Joining**: Joins with valid code
- [x] **User Names**: Preserved throughout session
- [x] **User List**: Real-time updates
- [x] **Video Streaming**: Peer-to-peer video works
- [x] **Video Labels**: Names appear correctly
- [x] **Chat**: Messages sent to all users
- [x] **Chat Names**: Sender identification works
- [x] **File Sharing**: Transfers between users
- [x] **File Labels**: Shows sender name
- [x] **Controls**: Mute/unmute/camera toggle
- [x] **Disconnect**: User removal works

### Responsive Design
- [x] **Desktop**: 3-column grid
- [x] **Tablet**: 2-column grid + sidebar toggle
- [x] **Mobile**: 1-column + full UI accessible
- [x] **Units**: Only rem/vh/vw (no fixed px)
- [x] **Touch**: Buttons clickable at 2.75rem+

### Performance
- [x] **2 Users**: Should be instant
- [x] **3 Users**: May take 2-3 seconds to connect
- [x] **4+ Users**: May take 5-10 seconds
- [x] **Network**: Monitor bandwidth in DevTools

### Edge Cases
- [x] **User with same name**: Should work (gets unique ID)
- [x] **Room full (6 users)**: 7th user gets error
- [x] **Leave & rejoin**: Starts fresh connection
- [x] **Network lag**: Should recover (ICE candidates)
- [x] **Tab close**: Proper cleanup (browser close listener)

---

## 🎯 Success Criteria

✅ **Basic (2 Users)**
- [ ] Can create and join rooms
- [ ] Both see video and chat works

✅ **Group (3-6 Users)**
- [ ] All connections establish within 10 seconds
- [ ] All videos display in grid
- [ ] User names visible everywhere
- [ ] Chat works for all users

✅ **Responsive**
- [ ] Works on desktop/tablet/mobile
- [ ] No layout breaks at any resolution
- [ ] All controls accessible

✅ **Quality**
- [ ] No console errors
- [ ] WebSocket reconnects if dropped
- [ ] Videos sync properly
- [ ] Chat instant delivery

---

## 📝 Notes

- First connection may take 5-10 seconds (ICE gathering)
- Each user needs ~100KB/s bandwidth for 720p video
- Using STUN/TURN servers from openrelay.metered.ca (public, limited)
- For production, set up your own TURN servers

---

**Ready to test? Start the server and begin! 🚀**
