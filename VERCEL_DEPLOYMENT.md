# 🚀 Vercel Deployment Guide for WebRTC BiFrost

## ⚠️ Important: Vercel Limitations with WebRTC

**Vercel has significant limitations for WebRTC projects:**

| Feature | Vercel | Status |
|---------|--------|--------|
| Frontend (React/Vite) | ✅ Excellent | Perfect |
| WebSocket | ❌ Limited | Serverless doesn't support long-lived connections |
| Node.js Backend | ⚠️ Limited | Only on Pro/Enterprise |
| Free Tier WebSocket | ❌ No | Pro tier required |

---

## 🎯 Two Deployment Strategies

### **Strategy 1: Vercel + Separate Backend** (Recommended)
Deploy **frontend on Vercel** + **backend on Render/Fly.io**

**Pros:**
- ✅ Best of both worlds
- ✅ Optimize each separately
- ✅ Cheaper overall
- ✅ Better WebSocket support for backend

**Cons:**
- ⚠️ CORS needed between frontend & backend
- ❌ Slightly more complex setup

---

### **Strategy 2: Full Vercel** (Not Recommended)
Deploy everything on Vercel Pro tier

**Pros:**
- ✅ Single platform
- ✅ Easy integration

**Cons:**
- ❌ Expensive ($20+/mo)
- ❌ Limited WebSocket support
- ❌ Serverless limitations
- ❌ Not ideal for long-lived connections

---

## 📋 Recommended: Vercel (Frontend) + Render (Backend)

### **Frontend on Vercel (Free)**

#### Step 1: Prepare Frontend
```bash
cd client
npm run build
```

#### Step 2: Create .vercelignore
```bash
# In project root
cat > .vercelignore << EOF
server/
.env
*.local
node_modules/
.git/
EOF
```

#### Step 3: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/dist/index.html"
    }
  ]
}
```

#### Step 4: Update Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

---

### **Backend on Render**

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

---

## 🔗 Cross-Origin Configuration

The frontend will make requests to backend on different domain.

### Update Client WebSocket URL
```javascript
// client/src/services/websocket.js

class WebSocketService {
  constructor() {
    this.ws = null
    
    // Use environment variable or fallback
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const protocol = backendUrl.includes('https') ? 'wss' : 'ws'
    
    this.url = `${protocol}://${backendUrl.split('://')[1]}`
    // ...
  }
}
```

### Create .env.production
```bash
# In client directory
VITE_BACKEND_URL=https://your-render-backend.onrender.com
```

---

## 🚀 Quick Vercel Frontend Deployment

### Option 1: Using Vercel CLI (Quickest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel --prod

# Vercel will ask:
# 1. Project name
# 2. Directory (leave blank for root)
# 3. Build command (leave default)
# 4. Output directory: client/dist
```

### Option 2: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project"**
4. **Select your GitHub repository**
5. **Configure:**
   - Framework: Vite
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Root Directory: `./`

6. **Add Environment Variables:**
   - `VITE_BACKEND_URL`: Your Render backend URL
   - Any other client-side env vars

7. **Deploy!**

---

## 🌍 Environment Variables

### Vercel Dashboard → Settings → Environment Variables

Add:
```
VITE_BACKEND_URL=https://your-render-backend.onrender.com
VITE_API_KEY=your_key (if needed)
```

---

## 🔒 Update CORS on Backend

When frontend is on Vercel domain, update backend CORS:

```javascript
// server/src/index.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5174',
    'https://your-vercel-domain.vercel.app'
  ],
  credentials: true
}))
```

---

## ❌ Why Full Vercel Isn't Ideal

### Serverless Function Limitations:
- ❌ 60-second timeout (WebSocket needs long-lived)
- ❌ Can't handle thousands of concurrent connections
- ❌ No persistent process for signaling
- ❌ Expensive for constant connections

### Better Alternatives:
- ✅ Render (native WebSocket, $7+/mo)
- ✅ Fly.io (better performance, $3+/mo)
- ✅ Railway (simple, $5+/mo)

---

## ✅ Recommended Setup

```
┌─────────────────────────────────────────┐
│        VERCEL (Frontend Only)           │
├─────────────────────────────────────────┤
│ React + Vite                            │
│ https://your-app.vercel.app             │
│ ✅ Free              ✅ Fast CDN        │
└────────────────────┬────────────────────┘
                     │ HTTPS/WSS
                     ↓
┌─────────────────────────────────────────┐
│         RENDER (Backend Only)           │
├─────────────────────────────────────────┤
│ Node.js + Express + WebSocket           │
│ https://your-backend.onrender.com       │
│ ✅ $7/mo            ✅ WebSocket native │
└─────────────────────────────────────────┘
```

---

## 📊 Cost Comparison

| Platform Combo | Monthly | Setup Difficulty |
|---|---|---|
| Vercel Pro + Render | $27 | ⭐⭐ Easy |
| Vercel Pro Only | $20 | ⭐ Super Easy |
| Render Only | $7 | ⭐⭐ Easy |
| Fly.io + Vercel | $20 | ⭐⭐ Easy |

---

## 🎯 My Final Recommendation

**Best Option: Vercel (Frontend) + Render (Backend)**
- ✅ Frontend on free Vercel tier
- ✅ Backend on affordable Render ($7/mo)
- ✅ Proper WebSocket support
- ✅ Only $7/month total
- ✅ Excellent performance
- ✅ Easy GitHub integration

**Next Best: Switch to Render Only**
- Much simpler deployment
- Only $7/mo for both frontend & backend
- Native WebSocket support
- See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

---

## 📝 Deployment Checklist

- [ ] Frontend builds: `npm run build` in client/
- [ ] vercel.json created in root
- [ ] .vercelignore created
- [ ] Environment variables set
- [ ] Backend deployed (Render or Fly.io)
- [ ] CORS configured on backend
- [ ] Client WebSocket URL points to backend
- [ ] Test all features after deploy
- [ ] Monitor logs for errors

---

## 🆘 Troubleshooting

### WebSocket Connection Fails
- ❌ **Cause**: Using Vercel serverless for backend
- ✅ **Solution**: Deploy backend to Render/Fly.io instead

### CORS Error
- ❌ **Cause**: Frontend domain not in CORS whitelist
- ✅ **Solution**: Add Vercel domain to backend CORS config

### 404 on API Calls
- ❌ **Cause**: Wrong backend URL or CORS blocking
- ✅ **Solution**: Check `VITE_BACKEND_URL` environment variable

---

**Next Step:** I recommend Vercel for frontend + Render for backend. Would you like a Render deployment guide?
