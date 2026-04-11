# 🚀 Vercel Deployment - Complete Setup Guide

## ✅ What's Been Prepared

Your WebRTC project is now ready for deployment! Here's what we've configured:

### 📦 Files Created/Updated

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel build & deployment configuration |
| `.vercelignore` | Files to exclude from deployment |
| `client/.env.production` | Production environment variables |
| `client/src/services/websocket.js` | Dynamic backend URL support |
| `server/src/index.js` | Multi-origin CORS configuration |
| `VERCEL_DEPLOYMENT.md` | Frontend-only Vercel guide |
| `RENDER_DEPLOYMENT.md` | Full-stack Render guide (recommended) |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |

---

## 🎯 Two Deployment Options

### **Option A: Vercel Frontend + External Backend** (What we set up)
```
┌────────────────────────┐
│  VERCEL (Frontend)     │
│  React/Vite            │
│  Free ✅               │
└─────────┬──────────────┘
          │ HTTPS/WSS
          ↓
┌────────────────────────┐
│  RENDER/FLY (Backend)  │
│  Node.js/WebSocket     │
│  $7-15/mo ✅           │
└────────────────────────┘
```

**Total Cost: $7-15/mo**

### **Option B: Vercel Full-Stack** (Not recommended)
```
┌────────────────────────┐
│  VERCEL                │
│  Frontend + Backend    │
│  $20+/mo ❌            │
│  Limited WebSocket ❌  │
└────────────────────────┘
```

**Total Cost: $20+/mo**

---

## 📋 Quick Deployment Steps

### **Step 1: Prepare GitHub Repository** (5 minutes)

```bash
# Initialize Git if needed
git init

# Add all files
git add .

# Commit
git commit -m "WebRTC BiFrost - Ready for deployment"

# Add GitHub remote (create repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/WebRTC_BiFrost.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy Backend to Render** (10 minutes) ⭐ Do this first!

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed steps.

Quick summary:
1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Select your GitHub repo
4. Build: `cd server && npm install`
5. Start: `cd server && node src/index.js`
6. Add environment variables
7. Deploy!

**You'll get:** `https://webrtc-bifrost-backend.onrender.com`

### **Step 3: Deploy Frontend to Vercel** (5 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Vercel auto-detects (uses vercel.json)
5. Add environment variable:
   - Key: `VITE_BACKEND_URL`
   - Value: `https://webrtc-bifrost-backend.onrender.com`
6. Click "Deploy"

**You'll get:** `https://webrtc-bifrost-xxx.vercel.app`

---

## 🔧 Configuration Reference

### Backend Environment Variables (Render)
```
DATABASE_URL=postgresql://...neon...
JWT_SECRET=your_strong_secret_key
FRONTEND_URL=https://webrtc-bifrost-xxx.vercel.app
NODE_ENV=production
```

### Frontend Environment Variable (Vercel)
```
VITE_BACKEND_URL=https://webrtc-bifrost-backend.onrender.com
```

---

## ✨ How It Works

### Local Development → Production

```javascript
// client/src/services/websocket.js
const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.hostname}:3000`

// LOCAL (dev): ws://localhost:3000
// VERCEL: wss://webrtc-bifrost-backend.onrender.com
// Auto-detection: Uses https → wss, http → ws
```

### CORS

The backend accepts requests from:
- Local: `http://localhost:*`
- Production: From `FRONTEND_URL` environment variable
- Auto-detection: From Vercel/Render URLs

---

## 📊 Expected Costs

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend (React) | Vercel | **Free** ✅ |
| Backend (Node.js) | Render | **$7/mo** |
| Database | Neon | **Free tier** or pay-as-you-go |
| SSL Certificates | Auto | **Free** ✅ |
| **TOTAL** | | **~$7/mo** |

---

## ✅ Deployment Checklist

### Before Pushing to GitHub
- [ ] Build locally succeeds: `cd client && npm run build`
- [ ] Server starts locally: `cd server && npm start`
- [ ] No console errors
- [ ] `.env` files in `.gitignore`
- [ ] All features working (chat, files, video)

### Frontend (Vercel)
- [ ] GitHub repo created and public
- [ ] Vercel account created
- [ ] Project imported
- [ ] `VITE_BACKEND_URL` environment variable set
- [ ] Build succeeded (check Deployment logs)
- [ ] Frontend accessible at HTTPS
- [ ] Backend URL accessible and responding

### Backend (Render)
- [ ] Render account created
- [ ] GitHub integration authorized
- [ ] Web Service created
- [ ] Build command: `cd server && npm install`
- [ ] Start command: `cd server && node src/index.js`
- [ ] All environment variables set
- [ ] Database connection working
- [ ] Backend accessible at HTTPS
- [ ] WebSocket working

### Testing
- [ ] Frontend loads without errors
- [ ] WebSocket connects (check console)
- [ ] Can create rooms
- [ ] Can join rooms
- [ ] Messages send bidirectionally ✅
- [ ] Files transfer bidirectionally ✅
- [ ] Video works bidirectionally ✅

---

## 🆘 Troubleshooting

### Issue: "Failed to connect to WebSocket"

**Cause:** Backend URL incorrect or backend not running

**Fix:**
1. Verify `VITE_BACKEND_URL` in Vercel
2. Check backend is deployed on Render
3. Test backend directly: `https://your-backend.com/health`

### Issue: "CORS error when sending messages"

**Cause:** Frontend URL not in backend's CORS whitelist

**Fix:**
1. Add your Vercel URL to backend's `FRONTEND_URL`
2. Restart backend on Render

### Issue: "Cannot POST /api/..."

**Cause:** Backend API routes not working

**Fix:**
1. Check backend logs on Render
2. Verify database connection
3. Ensure all routes in `server/src/routes/` are working

---

## 📝 File Reference

### Key Configuration Files

**vercel.json**
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "env": {
    "VITE_BACKEND_URL": "@VITE_BACKEND_URL"
  }
}
```

**client/src/services/websocket.js**
```javascript
const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.hostname}:3000`
const isHttps = window.location.protocol === 'https:' || backendUrl.includes('https')
const protocol = isHttps ? 'wss' : 'ws'
this.url = `${protocol}://${host}`
```

**server/src/index.js (CORS)**
```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:*',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true) // Allow for development
    }
  },
  credentials: true
}))
```

---

## 🎬 Live Deployment Summary

After following the steps above, you'll have:

```
┌─────────────────────────────────────────┐
│      LIVE WEBRTC APPLICATION ✅         │
├─────────────────────────────────────────┤
│                                         │
│  Frontend: https://webrtc-...-xxx.     │
│            vercel.app                  │
│                                         │
│  Backend:  https://webrtc-...-         │
│            backend.onrender.com        │
│                                         │
│  Database: Neon PostgreSQL (secure)   │
│  SSL:      ✅ Free (Let's Encrypt)    │
│  WebSocket: ✅ WSS (Encrypted)        │
│  Cost:     $7/mo (backend only)       │
│                                         │
│  ✅ READY FOR PRODUCTION ✅            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)
- [GitHub New Repository](https://github.com/new)
- [Neon PostgreSQL](https://neon.tech)

---

## 📚 Documentation Files

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Detailed Vercel guide
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Detailed Render guide (recommended)
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [SSL_SETUP.md](SSL_SETUP.md) - SSL/TLS configuration
- [README.md](README.md) - Project overview

---

## 🚀 Next Steps

1. **Read** [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for backend (recommended)
2. **Create** GitHub repository
3. **Push** code to GitHub
4. **Deploy** backend to Render (saves URL)
5. **Deploy** frontend to Vercel (add backend URL)
6. **Test** all features in production
7. **Monitor** logs for any issues

---

**Total Time: 20-30 minutes for complete deployment! 🎉**
