# 🔐 SSL/TLS Configuration Guide

This document explains how to enable encrypted HTTPS/WSS communication for your WebRTC application.

## Current Status

- **HTTP/WS**: ✅ Working (development mode)
- **HTTPS/WSS**: ⏳ Ready when certificates are generated

## Why Encryption?

| Component | Before | After |
|-----------|--------|-------|
| **WebSocket Signaling** | Plain text (❌ unsafe) | Encrypted (✅ secure) |
| **P2P Data** | Already DTLS-SRTP encrypted | Same (✅ secure) |
| **Database** | TLS required (✅ secure) | Same (✅ secure) |
| **API Endpoints** | Plain HTTP | Encrypted HTTPS |

## Quick Start - Development

### Option 1: Using mkcert (Easiest)

```bash
# Install mkcert
# Windows: choco install mkcert
# Mac: brew install mkcert
# Linux: follow https://github.com/FiloSottile/mkcert

# Generate certificate
cd server
mkcert localhost 127.0.0.1

# Rename to match expected names
mv localhost+1-key.pem server.key
mv localhost+1.pem server.crt
```

### Option 2: Windows PowerShell

```powershell
$cert = New-SelfSignedCertificate -DnsName localhost -CertStoreLocation cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(1)
Export-Certificate -Cert $cert -FilePath server/server.crt -Force
Export-PfxCertificate -Cert $cert -FilePath server/temp.pfx -Password (ConvertTo-SecureString -String "password" -Force -AsPlainText)
# Extract key from PFX if needed
```

### Option 3: Linux/macOS (OpenSSL)

```bash
cd server
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost"
```

## Production Setup

For production, obtain proper SSL certificates:

1. **Let's Encrypt** (Free, automated)
   ```bash
   # Using Certbot
   certbot certonly --standalone -d yourdomain.com
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem server/server.key
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem server/server.crt
   ```

2. **Commercial CA** (e.g., Namecheap, GoDaddy)
   - Purchase certificate
   - Download certificate bundle
   - Place in `server/` as `server.crt` and `server.key`

## File Locations

```
server/
├── server.crt      ← Certificate file (public)
├── server.key      ← Private key file (keep secret!)
└── src/
    ├── config/
    │   └── ssl.js  ← SSL configuration
    └── index.js    ← Uses SSL config
```

## What Happens When Files Exist

### ✅ Certificates Found
```
🔒 Using HTTPS (WSS enabled)
↓
Server runs on: https://localhost:3000
WebSocket uses: wss://localhost:3000
🔐 All communication encrypted
```

### ❌ Certificates Not Found
```
⚠️  Using HTTP (WS only - development mode)
↓
Server runs on: http://localhost:3000
WebSocket uses: ws://localhost:3000
💡 For production, generate SSL certificates
```

## Browser Warnings

When using self-signed certificates, browsers will show warnings:

```
⚠️ "Your connection is not private"
```

**This is NORMAL and EXPECTED** for self-signed certs. To bypass:

1. **Chrome**: Click "Advanced" → "Proceed to localhost (unsafe)"
2. **Firefox**: Click "Advanced" → "Accept Risk and Continue"
3. **Safari**: Ignore warning or add to exceptions

**Production**: No warnings with proper CA certificates.

## Client Configuration

The client automatically detects encryption:

```javascript
// In client/src/services/websocket.js
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
this.url = `${protocol}://${window.location.hostname}:3000`
```

- Page loaded via HTTPS → Uses WSS 🔒
- Page loaded via HTTP → Uses WS ⚠️

## Environment Variables

Optional environment variables (currently not needed):

```bash
# .env (server)
ENABLE_HTTPS=true
CERT_PATH=./server.crt
KEY_PATH=./server.key
```

**Note**: Currently auto-detected from file existence.

## Verification

### Check if HTTPS is Working

```bash
# Terminal
curl -k https://localhost:3000/health

# Browser
# Open https://localhost:3000
# Check browser console (F12) for:
# ✓ WebSocket connected
# 🔒 Connection is encrypted (WSS)
```

### Check Current Protocol

```javascript
// Browser console
console.log(wsService.url)
// Output: wss://localhost:3000 (encrypted)
// or: ws://localhost:3000 (unencrypted)
```

## Security Checklist

- [ ] Certificate files exist (`server.crt`, `server.key`)
- [ ] Server logs show `🔒 Using HTTPS (WSS enabled)`
- [ ] Client logs show `🔒 Connection is encrypted (WSS)`
- [ ] All three features working (chat, files, video)
- [ ] No console errors about certificate validation
- [ ] Database connection uses `sslmode=require` ✅ (already configured)

## Common Issues

### 1. "WebSocket connection to 'wss://...' failed"

**Cause**: Certificate not trusted, or not HTTP secured context

**Solution**:
- Visit `https://localhost:3000` before using app (accept certificate)
- Use proper CA certificate for production
- Ensure page loaded via HTTPS if WSS used

### 2. "NET::ERR_CERT_AUTHORITY_INVALID"

**Cause**: Browser doesn't trust self-signed cert

**Solution**: 
- Normal for self-signed certs
- Click "Proceed anyway" in browser
- Use proper CA certificate in production

### 3. Mixed Content Error

If page is HTTPS but WebSocket is WS:
```
Blocked: "Mixed Content: The page was loaded over HTTPS, 
but requested an insecure WebSocket connection"
```

**Solution**: Ensure page and WebSocket use same protocol (HTTPS+WSS or HTTP+WS)

## Architecture

```
┌─────────────────────────────────────────────────┐
│           ENCRYPTED COMMUNICATION               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Client (Browser)          Server (Node.js)    │
│  ================          ================    │
│                                                 │
│  HTTPS/TLS ◄──────────────► HTTPS/TLS         │
│  (API requests)            (Express)          │
│                                                 │
│  WSS ◄──────────────────────► WSS             │
│  (WebSocket signaling)      (WebSocket)       │
│                                                 │
│  DTLS-SRTP ◄──────────────► DTLS-SRTP        │
│  (P2P media)               (P2P media)        │
│                                                 │
└─────────────────────────────────────────────────┘
                      ↓
          All communication encrypted
```

## Next Steps

1. **Generate certificates** using one of the options above
2. **Restart server** - it will auto-detect certificates
3. **Verify in browser** - check console logs
4. **Test all features** - chat, files, video should work
5. **Production**: Replace self-signed certs with proper CA certificates

---

**Questions?** Check console logs for detailed encryption status.
