# WebRTC Connection Troubleshooting Guide

## 🔴 Error: "Failed to join room: Room not found"

### What This Means
The client sent a valid join request, but the signaling server couldn't find the room. This typically happens because:

1. **Server Restart**: The room was created but the server restarted (loses in-memory room data)
2. **Wrong Room Code**: The room code was copied/entered incorrectly  
3. **Room Expired**: Too much time passed between room creation and join attempt
4. **Multiple Server Instances**: Different servers handling create vs join (not applicable in single-process Render deployment)

---

## ✅ How to Debug

### Step 1: Check Server Status

**Check if server is running:**
```bash
curl https://webrtc-bifrost.onrender.com/health
```

Should return:
```json
{ "status": "ok", "timestamp": "2026-04-25T..." }
```

### Step 2: Check Available Rooms

**Check what rooms currently exist on server:**
```bash
curl https://webrtc-bifrost.onrender.com/api/debug/rooms
```

Expected output:
```json
{
  "activeRooms": 1,
  "rooms": [
    {
      "roomId": "ABC123XYZ",
      "userCount": 1,
      "users": [
        {
          "name": "Alice",
          "clientId": "user_abc123",
          "joinedAt": "2026-04-25T10:30:00.000Z"
        }
      ],
      "createdAt": "2026-04-25T10:30:00.000Z",
      "ageSeconds": 45
    }
  ],
  "timestamp": "2026-04-25T10:30:45.000Z"
}
```

### Step 3: Check Browser Console

Open browser DevTools (F12) and look for:

#### ✅ Successful Room Creation:
```
✓ WebSocket connected
📝 Room creation details: ID='77OGIVPPZ', User='Alice', Success=true
🏠 Room created: 77OGIVPPZ Client ID: user_abc123
```

#### ✅ Successful Room Join:
```
✓ WebSocket connected
👥 Joining room: 77OGIVPPZ
📤 Sending: join
📨 Message received: join_confirmed
✓ Joined room: 77OGIVPPZ Client ID: user_xyz789
```

#### ❌ Join Failure:
```
👥 Joining room: 77OGIVPPZ
📤 Sending: join
📨 Message received: error
❌ Server error: Failed to join room: Room not found
📋 Available rooms: NONE
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Room not found" but room was just created

**Possible Cause:** Server restarted or crashed

**Solution:**
1. Check server status: `curl https://webrtc-bifrost.onrender.com/health`
2. If server is down, it will fail (need to redeploy)
3. If server is running but room gone → server has restarted
4. Create a new room and immediately have user join (don't wait)

**Why It Happens:**
- Render's free tier can auto-restart servers
- If server crashes, in-memory rooms are lost
- Rooms are NOT persisted to database (only created in RAM)

**Fix:**
Add room persistence to database (future enhancement)

---

### Issue 2: Room code doesn't match

**Symptoms:**
- "Room not found" error
- Available rooms show different code than what was entered

**Check:**
1. Verify room code copied correctly (no extra spaces)
2. Check if room code is case-sensitive (it is)
3. Copy directly from the "Share" button instead of typing

**Debug:**
```
Created room: 77OGIVPPZ ← These must match exactly
Joining room: 77ogivppz ← Even lowercase is different!
```

---

### Issue 3: Room expires after waiting too long

**Symptoms:**
- Create room works fine
- Wait 5+ minutes before joining
- Get "room not found" error

**Why:**
- Rooms in memory are created fresh each session
- If server garbage collects or restarts, room is gone
- No timeout implemented yet

**Solution:**
- Join immediately after creating room (< 1 minute)
- If need to wait, implement persistent storage

---

### Issue 4: Different users on different servers

**Not applicable for Render single-process deployment, but if scaled:**

If error shows `available_rooms: NONE` when you just created room:
- Could indicate request went to different server instance
- Render typically uses 1 dyno, so this shouldn't happen
- If scaled to multiple dynos, need redis-shared room state

---

## 🔍 What Server Logs Show

### Room Creation Log:
```
🏠 Room created: 77OGIVPPZ
📝 Room creation details: ID='77OGIVPPZ', User='Alice', Success=true
👥 Client "Alice" joined room 77OGIVPPZ (1/6 users)
```

### Join Success Log:
```
📋 Available rooms: 77OGIVPPZ
👥 Client "Bob" joined room 77OGIVPPZ (2/6 users)
```

### Join Failure Log:
```
📋 Available rooms: NONE
❌ Room not found: 77OGIVPPZ. Available: NONE
❌ Join failed for 77OGIVPPZ: Room not found
```

---

## 🚀 Testing Procedure

### Test 1: Immediate Join (Should Work)
1. Click "Create Room"
2. Enter name
3. Copy room code
4. Immediately open new browser tab
5. Click "Join Room"
6. Paste code
7. Enter different name
8. **Should succeed** ✓

### Test 2: Delayed Join (May Fail)
1. Click "Create Room"
2. Enter name
3. Copy room code
4. **Wait 5 minutes**
5. Open new browser tab
6. Click "Join Room"
7. Paste code
8. **May fail if server restarted** ✗

### Test 3: Multiple Joins (Should Work)
1. Create room
2. Join with User A
3. Join with User B (immediately)
4. Join with User C (immediately)
5. All 3 should see each other in video grid ✓

---

## 💡 Quick Fixes

### Fix 1: Create New Room
If you get "room not found":
- Go back to landing page
- Click "Create Room" again
- Get new room code
- Share immediately

### Fix 2: Refresh Client (if joined but waiting for video)
- F5 to refresh
- Try joining again
- Sometimes helps with stuck connections

### Fix 3: Check URL
Verify you're on: `https://webrtc-bifrost.onrender.com`

Not: `http://` (must be HTTPS for production)

### Fix 4: Clear Browser Cache
- F12 → Application → Clear storage
- Reload page
- Try again

---

## 📊 Expected Behavior Timeline

```
T=0s:   User A creates room "ABC123"
        ✓ Server creates room in memory
        ✓ Room exists in roomManager.rooms

T=0s:   User A gets room code
        ✓ Browser shows "Share room: ABC123"

T=5s:   User B joins with code "ABC123"
        ✓ Server finds room
        ✓ User B connects to User A
        ✓ Video grid shows both users

T=300s: Server restarts
        ✗ All rooms in memory cleared
        ✗ "ABC123" no longer exists

T=305s: User C tries to join "ABC123"
        ✗ Room not found (server restarted)
        ✗ User C gets error
```

---

## 🔐 Error Response Format

When you get an error, the server now sends detailed info:

```json
{
  "type": "error",
  "payload": {
    "message": "Failed to join room: Room not found",
    "roomId": "77OGIVPPZ",
    "available_rooms": "NONE"
  }
}
```

This tells you:
- **message**: What went wrong
- **roomId**: The room code that was attempted
- **available_rooms**: What rooms are currently available (comma-separated list)

---

## 📱 Mobile Specific

If joining from mobile:
- Ensure HTTPS works (might block WSS otherwise)
- Check WiFi is stable
- Try 5GHz WiFi instead of 2.4GHz

---

## 🎯 Verification Checklist

- [x] Server running (`/health` returns 200)
- [x] WebSocket connects (console shows "✓ WebSocket connected")
- [x] Room code matches exactly (case-sensitive)
- [x] Joining immediately after creation (< 1 minute)
- [x] Using HTTPS URL for production
- [x] Browser allows camera/microphone permissions
- [x] Room doesn't exceed 6 users

---

## 📞 Still Having Issues?

1. **Check console logs** (F12)
   - Look for error messages
   - Note the exact room code and error

2. **Check server status**
   - Run `/health` endpoint
   - Run `/api/debug/rooms` to see active rooms

3. **Try browser DevTools**
   - Network tab: Check WebSocket messages
   - Console: Look for detailed error logs

4. **Check deployment status**
   - For Render: Visit https://dashboard.render.com
   - Check if service is running/crashed

---

## 🔮 Future Improvements

To prevent "room not found" errors:

1. **Database Persistence**
   - Store rooms in PostgreSQL
   - Survive server restarts
   - Persist chat history

2. **Room Expiration**
   - Set TTL on rooms (e.g., 24 hours)
   - Clean up empty rooms
   - Show room age in UI

3. **Reconnection Support**
   - Rejoin existing room after connection drop
   - Recover from server restart

4. **Multiple Server Scaling**
   - Use Redis for shared room state
   - Load balance across multiple dynos
   - Ensure room consistency

---

**Updated**: April 25, 2026
**Version**: 1.0 (Enhanced error handling)
