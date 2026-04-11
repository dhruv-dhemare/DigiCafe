# ✅ Deployment Checklist

## Pre-Deployment Setup

### Local Testing
- [ ] `npm install` in both client and server folders
- [ ] `npm run build` in client passes without errors
- [ ] Backend runs: `cd server && npm start`
- [ ] Frontend runs: `cd client && npm run dev`
- [ ] All features work (chat, files, video)
- [ ] No console errors in browser or terminal

---

## Choose Your Platform

### Option 1: **Vercel (Frontend Only)** ⭐ Easiest & Free
- [ ] Read [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- [ ] Deployment backend to Render/Fly.io first
- [ ] Set `VITE_BACKEND_URL` on Vercel
- [ ] Push to GitHub
- [ ] Deploy via Vercel dashboard

**Estimated time: 15 minutes**

### Option 2: **Render (Full Stack)** ⭐⭐ Recommended
- [ ] Read [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- [ ] Push to GitHub
- [ ] Create Render account
- [ ] Deploy frontend (static site)
- [ ] Deploy backend (web service)
- [ ] Set environment variables

**Estimated time: 20 minutes**

### Option 3: **Fly.io (Full Stack)**
- [ ] Install flyctl: `npm install -g flyctl`
- [ ] Login: `flyctl auth login`
- [ ] Generate app: `flyctl launch`
- [ ] Configure `fly.toml`
- [ ] Deploy: `flyctl deploy`

**Estimated time: 20 minutes**

---

## GitHub Preparation

- [ ] Create GitHub account if needed
- [ ] Create new repository
- [ ] Add `.gitignore`:
  ```
  node_modules/
  .env
  .env.local
  .env.*.local
  dist/
  build/
  *.log
  ```
- [ ] Push code:
  ```bash
  git add .
  git commit -m "WebRTC BiFrost - Ready for deployment"
  git push origin main
  ```

---

## Environment Variables

### Vercel Dashboard
- [ ] `VITE_BACKEND_URL`: `https://your-backend-url.com`

### Render Dashboard (Frontend)
- [ ] `VITE_BACKEND_URL`: `https://your-backend-url.onrender.com`

### Render Dashboard (Backend)
- [ ] `DATABASE_URL`: Your Neon PostgreSQL URL
- [ ] `JWT_SECRET`: Your secret key
- [ ] `FRONTEND_URL`: The Render frontend URL
- [ ] `NODE_ENV`: `production`

---

## Post-Deployment

### Frontend URL
- [ ] Copy frontend URL from provider
- [ ] Test in browser (check console for errors)
- [ ] Verify SSL certificate (lock icon visible)

### Backend URL
- [ ] Test health endpoint: `https://your-backend.com/health`
- [ ] Check CORS is working
- [ ] Verify WebSocket connection in console

### Feature Testing
- [ ] Create room and get code
- [ ] Join from another window (incognito)
- [ ] Send message: Peer A → Peer B ✅
- [ ] Send message: Peer B → Peer A ✅
- [ ] Upload file: Peer A → Peer B ✅
- [ ] Upload file: Peer B → Peer A ✅
- [ ] Start video: Peer A → visible on Peer B ✅
- [ ] Start video: Peer B → visible on Peer A ✅

---

## Monitoring

### View Logs

**Vercel:**
- Dashboard → Project → Deployments → Click → Logs

**Render:**
- Dashboard → Select service → Logs tab

**Fly.io:**
- `flyctl logs`

### Common Issues

| Error | Solution |
|-------|----------|
| WebSocket fails | Check backend is running, CORS is set |
| CORS blocked | Add frontend URL to backend's CORS list |
| Database error | Verify DATABASE_URL and connection |
| 404 on frontend | Check build directory is set correctly |
| Slow uploads/downloads | Check file chunk size (default: 16KB) |

---

## Security Checklist

- [ ] HTTPS/WSS enabled (auto on all platforms)
- [ ] Environment variables not committed to Git
- [ ] JWT_SECRET is strong and unique
- [ ] Database connection requires SSL (`sslmode=require`)
- [ ] CORS only allows known origins (not `*`)
- [ ] `.env` files in `.gitignore`

---

## Estimated Costs

| Platform | Monthly | Includes |
|----------|---------|----------|
| Vercel Free | $0 | Frontend only |
| Vercel Pro | $20 | Frontend, limited backend |
| Render Frontend | Free | React/Vite hosting |
| Render Backend | $7 | Node.js with WebSocket |
| Fly.io | $3-15 | Full stack, global |

**Recommended: Render ($7/mo) or Fly.io ($5-15/mo)**

---

## Quick Links

- [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)
- [Render Deployment Guide](RENDER_DEPLOYMENT.md)
- [SSL/TLS Setup](SSL_SETUP.md)
- [Project README](README.md)

---

## Support

### Common Questions

**Q: Do I need to pay?**
- A: Vercel frontend is free. Backend costs $7-20/mo depending on platform.

**Q: How long does deployment take?**
- A: 15-30 minutes first time (includes account setup)

**Q: Can I use different platforms?**
- A: Yes! Frontend on Vercel, backend on Render/Fly.io works great.

**Q: What if deployment fails?**
- A: Check:
  1. Git repository is public (for GitHub integration)
  2. Build command succeeds locally
  3. Environment variables are set
  4. Database URL is correct

---

## 🎉 Next Steps

1. **Choose platform** (Vercel for frontend, Render for backend recommended)
2. **Push to GitHub**
3. **Connect your repository** to deployment platform
4. **Set environment variables**
5. **Click Deploy**
6. **Test all features**

---

**Ready? Start with [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) (recommended) or [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**
