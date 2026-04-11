# 🔧 Render Deployment Fix Guide

## ❌ What Went Wrong

The build command in Render was set to just `"install"` instead of `cd server && npm install`.

This happened because Render tried to auto-detect the project type but failed with the monorepo structure.

---

## ✅ How to Fix (2 Options)

### **Option 1: Using Render Dashboard** (Quickest - 5 minutes)

#### Step 1: Stop the Failed Deployment
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click on **"webrtc-bifrost-backend"** service
3. If it's still building, click **"Cancel"** (if available)

#### Step 2: Update Build Settings
1. Click **"Settings"** tab
2. Find **"Build Command"** field
3. **Replace with:**
   ```
   cd server && npm install
   ```
4. Find **"Start Command"** field
5. **Replace with:**
   ```
   cd server && node src/index.js
   ```
6. Click **"Save"**

#### Step 3: Redeploy
1. Click **"Deploy"** button
2. Select **"Latest Commit"**
3. Wait for deployment to complete (5-10 minutes)

---

### **Option 2: Using render.yaml** (Recommended - One-time setup)

#### Step 1: Commit render.yaml File
```bash
# File already created at d:\Projects\WEBRTC\render.yaml
git add render.yaml
git commit -m "Fix Render deployment configuration"
git push origin main
```

#### Step 2: Delete Current Service
1. Go to Render Dashboard
2. Click **"webrtc-bifrost-backend"**
3. Go to **"Settings"** → Scroll to bottom
4. Click **"Delete Service"**
5. Confirm deletion

#### Step 3: Redeploy from GitHub
1. Go to [render.com](https://render.com)
2. Click **"New +"**
3. Click **"Blueprint"**
4. Select your GitHub repository
5. Render will auto-detect `render.yaml`
6. Verify services are listed:
   - webrtc-bifrost-backend (Web Service)
   - webrtc-bifrost-frontend (Static Site)
7. Set environment variables:
   - `DATABASE_URL`: Your Neon URL
   - `JWT_SECRET`: Your secret
   - `VITE_BACKEND_URL`: The backend URL (get from dashboard)
8. Click **"Deploy"**

---

## 📋 Manual Setup (If render.yaml Doesn't Work)

### **Backend Service**

1. **New → Web Service**
2. **Configuration:**

   **Build Command:**
   ```
   cd server && npm install
   ```
   
   **Start Command:**
   ```
   cd server && node src/index.js
   ```
   
   **Environment Variables:**
   ```
   DATABASE_URL=postgresql://...your-neon-url...
   JWT_SECRET=your_secret_key_here
   NODE_ENV=production
   FRONTEND_URL=https://webrtc-bifrost-frontend.onrender.com
   PORT=3000
   ```
   
   **Name:** webrtc-bifrost-backend
   **Region:** Oregon (or your choice)
   **Plan:** Starter ($7/mo)

3. **Click "Create Web Service"**

### **Frontend Service**

1. **New → Static Site**
2. **Configuration:**

   **Build Command:**
   ```
   cd client && npm install && npm run build
   ```
   
   **Publish Directory:**
   ```
   client/dist
   ```
   
   **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://webrtc-bifrost-backend.onrender.com
   ```
   
   **Name:** webrtc-bifrost-frontend
   **Region:** Oregon (to match backend)
   **Plan:** Free

3. **Click "Create Static Site"**

---

## ⏱️ Deployment Timeline

| Step | Time | Status |
|------|------|--------|
| Fix build commands | 2 min | On Render dashboard |
| Restart build | 5-10 min | Building |
| Total | 10-15 min | ✅ Complete |

---

## ✅ Verify Deployment Success

### Check Backend
```bash
# Open in browser or curl
https://webrtc-bifrost-backend.onrender.com/health

# Should return:
{"status":"ok","timestamp":"2024-..."}
```

### Check Frontend
```
https://webrtc-bifrost-frontend.onrender.com

# Should show WebRTC app
# Check console (F12) for connection logs
```

### Test WebSocket Connection
1. Open frontend in browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for logs like:
   ```
   ✓ WebSocket connected
   🔒 Connection is encrypted (WSS)
   ```

---

## 🆘 If Still Failing

### Check Build Logs
1. Render Dashboard → Service
2. Click **"Logs"** tab
3. Look for errors like:
   ```
   npm ERR! code ENOENT
   npm ERR! syscall open
   npm ERR! path /var/task/server/package.json
   ```

### Common Issues

| Error | Fix |
|-------|-----|
| `Cannot find module` | Ensure `cd server` is in build command |
| `npm ERR! missing`` | Run `npm install` first in build command |
| `Port already in use` | Render assigns port via `$PORT` env var |
| `Database connection failed` | Verify DATABASE_URL in env vars |

### Verify Build Command Format
```
✅ CORRECT:   cd server && npm install
❌ WRONG:     npm install
❌ WRONG:     install
❌ WRONG:     cd server && npm i
```

---

## 📝 Expected Logs After Fix

```
==> Cloning from https://github.com/dhruv-dhemare/WebRTC_BiFrost
==> Checking out commit...
==> Using Node.js version 22.22.0
==> Running build command 'cd server && npm install'...

added X packages
audited Y packages
found 0 vulnerabilities

==> Build succeeded ✓
==> Launching...
⚠️  Using HTTP (WS only - development mode)
   For production, generate SSL certificates
🏠 Server running on port 3000
✓ WebSocket server listening
```

---

## 🎯 Next Steps

1. **Choose Fix Method:**
   - Quick: Update commands in dashboard (Option 1)
   - Better: Use render.yaml (Option 2)

2. **Apply the fix**

3. **Restart deployment**

4. **Test in browser**

5. **Monitor logs**

---

## 💡 Pro Tips

- Always use **full paths** in monorepo: `cd server && npm install`
- **Test locally** before pushing: `cd server && npm install && npm start`
- **Check logs** immediately after deploy starts
- **Save backend URL** after first deployment: `https://webrtc-bifrost-backend.onrender.com`

---

**Ready to fix? Choose Option 1 (quick) or Option 2 (better)! 🚀**
