# 🚨 RENDER DEPLOYMENT FIX - QUICK ACTION

## What Went Wrong
```
Build Command: "install"  ❌ WRONG
Should be: "cd server && npm install"  ✅ CORRECT
```

---

## 🔧 Fix in 5 Minutes

### Step 1: Go to Render Dashboard
👉 https://dashboard.render.com

### Step 2: Find Your Service
- Click on **"webrtc-bifrost-backend"**

### Step 3: Fix Build Command
1. Click **"Settings"** tab
2. Find **"Build Command"** field
3. Clear it completely
4. Paste:
   ```
   cd server && npm install
   ```
5. Click outside the field (auto-saves)

### Step 4: Fix Start Command
1. Find **"Start Command"** field
2. Clear it
3. Paste:
   ```
   cd server && node src/index.js
   ```
4. Click outside (auto-saves)

### Step 5: Redeploy
1. Click **"Deploy"** button (top right)
2. Choose **"Deploy latest commit"**
3. Wait 5-10 minutes for build to complete

---

## ✅ How to Know It's Working

When deployment completes, you'll see in Logs:
```
✓ Build succeeded
⚠️  Using HTTP (WS only - development mode)
🏠 Server running on port 3000
```

And get a live URL like:
```
https://webrtc-bifrost-backend.onrender.com
```

---

## Test It
```bash
# Test with curl (copy & paste in terminal)
curl https://webrtc-bifrost-backend.onrender.com/health

# Should return (may need to wait a moment):
{"status":"ok","timestamp":"2024-..."}
```

---

## 📝 After Backend is Live

1. **Copy the backend URL** from Render (e.g., `https://webrtc-bifrost-backend.onrender.com`)

2. **Deploy frontend to Vercel:**
   - Go to https://vercel.com
   - New Project → Select GitHub repo
   - Add environment variable:
     ```
     VITE_BACKEND_URL = https://webrtc-bifrost-backend.onrender.com
     ```
   - Deploy

3. **Test everything works!**

---

## ⏱️ Timeline
- Fix commands: 2 min
- Redeploy: 10 min
- **Total: 12 minutes** ⏰

---

**Go to Render Dashboard NOW and fix those commands! 🚀**
