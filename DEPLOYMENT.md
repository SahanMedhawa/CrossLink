# 🚀 Deployment Guide — CrossLink

> Backend deployed on **Render** · Frontend deployed on **Vercel**

← [Back to README](README.md)

---

## Architecture

```
┌───────────────────────┐       ┌───────────────────────┐
│      Vercel            │       │       Render           │
│  (Frontend - React)    │──────▶│   (Backend - Express)  │
│  https://crosslink-    │  API  │  https://crosslink-api │
│    app.vercel.app      │  ───▶ │    .onrender.com       │
└───────────────────────┘       └──────────┬────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │ MongoDB Atlas│
                                    │  (Database)  │
                                    └─────────────┘
```

---

## Backend Deployment (Render)

1. Push the repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
3. Connect your GitHub repository.
4. Configure:
   - **Name**: `crosslink-api`
   - **Region**: Oregon (or nearest)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Go to **Environment** tab and add variables (see table below).
6. Click **Deploy**.
7. After deployment, verify health check:
   ```
   GET https://crosslink-api.onrender.com/api/health
   ```

---

## Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**.
2. Import the same GitHub repository.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Go to **Environment Variables** and add variables (see table below).
5. Click **Deploy**.
6. After deployment, verify the app loads and API connectivity works.

---

## Environment Variables (Deployment)

**Backend (Render):**

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✓ | Set to `production` |
| `PORT` | ✓ | Render sets automatically, default `10000` |
| `MONGODB_URI` | ✓ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✓ | Strong random secret (not the default) |
| `FRONTEND_URL` | ✓ | Vercel app URL, e.g. `https://crosslink-app.vercel.app` |
| `CLOUD_NAME` | ✓ | Cloudinary cloud name |
| `CLOUD_API_KEY` | ✓ | Cloudinary API key |
| `CLOUD_API_SECRET` | ✓ | Cloudinary API secret |
| `NEWS_API_KEY` | Optional | NewsAPI.org API key |
| `EMAIL_USER` | Optional | Gmail address for notifications |
| `EMAIL_PASS` | Optional | Gmail app password |

**Frontend (Vercel):**

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✓ | Render backend URL with `/api`, e.g. `https://crosslink-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Optional | WebSocket URL (defaults to API origin) |

> **Important:** After deploying both platforms, update `FRONTEND_URL` on Render with your Vercel URL, and `VITE_API_URL` on Vercel with your Render URL. Both sides need to know about each other for CORS and API calls to work.

---

## Live URLs

| Service | URL |
|---------|-----|
| **Backend API** | `https://crosslink.onrender.com` |
| **Frontend App** | `https://cross-link-rust.vercel.app` |

---

## Deployment Evidence

Screenshots to include in your submission:
1. Render dashboard showing service status as **Live**
2. Successful `/api/health` response in browser
3. Vercel deployment status showing **Ready**
4. Frontend app loaded from Vercel URL
5. Browser DevTools Network tab showing successful API calls from frontend to backend
