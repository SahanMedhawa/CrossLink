# CrossLink — Cross-Sector Collaboration Platform

> A full-stack MERN application connecting **NGOs**, **Volunteers**, and **Corporates** for meaningful social impact through project collaboration, volunteer matching, corporate proposals, resource sharing, and real-time notifications.

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Redux Toolkit, MUI, Recharts, Leaflet, Socket.IO Client |
| **Backend** | Node.js, Express.js 4, Mongoose (MongoDB), JWT, Socket.IO, Cloudinary, Nodemailer |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## Table of Contents

1. [Features](#-features)
2. [Project Structure](#-project-structure)
3. [Prerequisites](#-prerequisites)
4. [Setup Instructions](#-setup-instructions)
5. [API Endpoint Documentation](#-api-endpoint-documentation)
6. [Deployment](DEPLOYMENT.md)
7. [Testing Instructions](TESTING.md)
8. [Environment Variables Reference](#-environment-variables-reference)
9. [Security](#-security)
10. [Troubleshooting](#-troubleshooting)
11. [License](#-license)

---

## 🚀 Features

### Multi-Role System
- **Volunteer** — Browse projects, skill-based matchmaking, apply to participate, track activity & impact points
- **NGO** — Create/manage projects, manage volunteers, SDG goal tracking, view corporate proposals & funding
- **Corporate** — Discover NGO partners, submit proposals, direct funding, resource donations, impact reports, CSR news feed

### Core Capabilities
- JWT-based authentication with role-based access control
- Real-time notifications via WebSocket (Socket.IO)
- Cloudinary image uploads for projects & profile photos
- Skill-based volunteer–project matchmaking engine
- Email notifications (Gmail SMTP)
- SDG (Sustainable Development Goals) integration via UN API
- Interactive maps with Leaflet
- Data visualisations with Recharts
- Redux Toolkit for global UI state management
- Responsive design with TailwindCSS

---

## 📁 Project Structure

```
CrossLink/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── ngo_management/
│   │   │   │   ├── ngo.controller.js
│   │   │   │   ├── projectcontroller.js
│   │   │   │   └── sdgController.js
│   │   │   ├── corporate_management/
│   │   │   │   ├── corporate.controller.js
│   │   │   │   ├── proposal.controller.js
│   │   │   │   ├── funding.controller.js
│   │   │   │   ├── news.controller.js
│   │   │   │   └── report.controller.js
│   │   │   ├── volunteer_management/
│   │   │   │   ├── volunteer.controller.js
│   │   │   │   ├── matchmaking.controller.js
│   │   │   │   └── participation.controller.js
│   │   │   └── resource_management/
│   │   │       └── resorceController.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── project.js
│   │   │   ├── proposal.js
│   │   │   ├── funding.js
│   │   │   ├── resorce.js
│   │   │   ├── participation.model.js
│   │   │   └── notification.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   ├── ngo_management/
│   │   │   ├── corporate_management/
│   │   │   ├── volunteer_management/
│   │   │   └── resource_management/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── upload.js
│   │   │   └── profileUpload.js
│   │   ├── services/
│   │   │   ├── notification.service.js
│   │   │   └── volunteer_management/
│   │   ├── socket/
│   │   │   └── socket.service.js
│   │   ├── utils/
│   │   │   ├── sendEmail.js
│   │   │   └── emailService.js
│   │   ├── app.js
│   │   └── server.js
│   ├── playwright-tests/          # API testing suite
│   ├── performance/               # Artillery load tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/
│   │   │   ├── user/              # Login, Register
│   │   │   ├── ngo/               # NGO dashboard, projects, SDG
│   │   │   ├── corporate/         # Corporate dashboard, proposals
│   │   │   ├── volunteer/         # Volunteer dashboard, applications
│   │   │   └── resource/          # Resource forms & management
│   │   ├── services/              # API client, Socket.IO, notification API
│   │   ├── context/               # AuthContext (React Context)
│   │   ├── store/                 # Redux Toolkit store & slices
│   │   ├── utils/                 # Image URL resolver
│   │   ├── constants/             # Skills & interests data
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── render.yaml                    # Render deployment blueprint
└── package.json                   # Monorepo scripts
```

---

## 📋 Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster
- **Git**

Optional services (for full functionality):
- [Cloudinary](https://cloudinary.com) account — image uploads
- [NewsAPI](https://newsapi.org) key — CSR news feed
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) — email notifications

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/CrossLink.git
cd CrossLink
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This installs root, backend, and frontend dependencies in one command.

### 3. Configure Backend Environment

Copy the example and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret
FRONTEND_URL=http://localhost:5173

# Optional integrations
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
NEWS_API_KEY=your-newsapi-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 4. Configure Frontend Environment (optional for local dev)

For local development, the Vite proxy handles API routing automatically. For production or custom backend URLs:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Application

```bash
# From root — starts both backend and frontend concurrently
npm run dev
```

Or start individually:

```bash
npm run dev:backend   # Backend on http://localhost:5000
npm run dev:frontend  # Frontend on http://localhost:5173
```

### 6. Verify

- **Backend health check**: `http://localhost:5000/api/health`
- **Frontend**: `http://localhost:5173`
- Register a new account and explore the dashboard for your role.

---

## 🔗 API Endpoint Documentation

**Base URL**: `http://localhost:5000/api` (dev) or `https://<your-render-service>.onrender.com/api` (production)

All protected routes require a JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | ✗ | Register a new user |
| `POST` | `/auth/login` | ✗ | Login and receive JWT |
| `GET` | `/auth/profile` | ✓ | Get current user's profile |
| `PUT` | `/auth/profile` | ✓ | Update current user's profile |
| `GET` | `/auth/user/:id` | ✗ | Get public user info by ID |

#### POST `/api/auth/signup`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "userType": "volunteer",
  "phone": "+94771234567",
  "location": "Colombo",
  "skills": ["Teaching", "Web Development"],
  "interests": ["Education", "Environment"],
  "availability": "weekends"
}
```

> `userType` must be one of: `volunteer`, `ngo`, `corporate`.
> Role-specific fields: volunteers send `skills/interests/availability`; NGOs send `organizationName/registrationNumber/focusAreas`; corporates send `companyName/industry/csrBudget`.

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "userType": "volunteer", ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "redirectPath": "/volunteer/dashboard"
  }
}
```

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123",
  "userType": "volunteer"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "userType": "volunteer", ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "redirectPath": "/volunteer/dashboard"
  }
}
```

---

### 2. NGO Routes (`/api/ngos`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/ngos` | ✗ | List all NGOs |

---

### 3. Projects (`/api/projects`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/projects/all` | ✗ | Get all active projects (supports `?focusArea=&skills=&location=&status=` filters) |
| `GET` | `/projects/:id` | ✗ | Get project by ID |
| `GET` | `/projects/ngoprojects/:ngoId` | ✗ | Get projects by a specific NGO |
| `POST` | `/projects` | ✓ (NGO) | Create new project (multipart/form-data with optional `image`) |
| `GET` | `/projects/ngo/my-projects` | ✓ (NGO) | Get current NGO's projects |
| `PUT` | `/projects/:id` | ✓ (NGO) | Update project (multipart/form-data) |
| `PUT` | `/projects/:id/status` | ✓ (NGO) | Update project status (`draft|active|completed|cancelled`) |
| `DELETE` | `/projects/:id` | ✓ (NGO) | Delete project |

#### POST `/api/projects` (Create Project)

**Request** (`multipart/form-data`):
```
title: "Clean Water Initiative"
description: "Providing clean water access..."
focusArea: "Environment"
location: "Kandy"
skills: '["Plumbing","Project Management"]'   // JSON string
startDate: "2026-05-01"
endDate: "2026-08-01"
volunteersNeeded: 15
image: <file>                                  // optional image file
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": { "_id": "...", "title": "Clean Water Initiative", ... }
}
```

---

### 4. SDG Goals (`/api/sdg`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/sdg/goals` | ✗ | Get all 17 UN SDG goals |
| `GET` | `/sdg/goals/:goalNumber/targets` | ✗ | Get targets for a specific goal |
| `GET` | `/sdg/srilanka` | ✗ | Get Sri Lanka SDG data |

---

### 5. Corporates (`/api/corporates`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/corporates` | ✓ | List all corporate users |
| `GET` | `/corporates/profile` | ✓ | Get current corporate's profile |
| `PUT` | `/corporates/profile` | ✓ | Update corporate profile |
| `GET` | `/corporates/dashboard-stats` | ✓ | Get corporate dashboard statistics |
| `GET` | `/corporates/:id` | ✓ | Get corporate by ID |

---

### 6. Proposals (`/api/proposals`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/proposals` | ✓ (Corporate) | Create a new proposal |
| `GET` | `/proposals/my` | ✓ (Corporate) | Get my sent proposals |
| `GET` | `/proposals/:id` | ✓ | Get proposal by ID |
| `PUT` | `/proposals/:id` | ✓ (Corporate) | Update my proposal |
| `DELETE` | `/proposals/:id` | ✓ (Corporate) | Delete my proposal |
| `GET` | `/proposals/project/:projectId` | ✓ (NGO) | Get proposals for a project |
| `PATCH` | `/proposals/:id/status` | ✓ (NGO) | Accept/reject proposal |
| `GET` | `/proposals/ngo/:ngoId` | ✓ | Get proposals for a specific NGO |

#### POST `/api/proposals`

**Request Body:**
```json
{
  "projectId": "665abc123...",
  "amount": 50000,
  "message": "We'd like to support your education initiative.",
  "type": "financial"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Proposal submitted successfully",
  "proposal": { "_id": "...", "status": "Pending", ... }
}
```

---

### 7. Funding (`/api/funding`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/funding` | ✓ (Corporate) | Create direct funding |
| `GET` | `/funding/my` | ✓ (Corporate) | Get my funding records |
| `GET` | `/funding/project/:projectId` | ✓ (NGO) | Get funding for a project |
| `GET` | `/funding/ngo/:ngoId` | ✓ | Get all fundings for an NGO |

---

### 8. Resources (`/api/resources`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/resources/all` | ✓ | Get all resources |
| `GET` | `/resources/project/:projectId` | ✓ | Get resources for a project |
| `GET` | `/resources/project/:projectId/status` | ✓ | Get resource status for a project |
| `GET` | `/resources/:resourceId` | ✓ | Get single resource |
| `POST` | `/resources/:projectId/donate` | ✓ (Corporate) | Donate resource to project |
| `PUT` | `/resources/:resourceId` | ✓ | Update resource |
| `DELETE` | `/resources/:resourceId` | ✓ | Delete resource |

---

### 9. Volunteer Management

#### Volunteer Profile (`/api/volunteer`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/volunteer/profile` | ✓ (Volunteer) | Get my volunteer profile |
| `PUT` | `/volunteer/profile` | ✓ (Volunteer) | Update profile (supports photo upload) |
| `DELETE` | `/volunteer/profile` | ✓ (Volunteer) | Delete my account |
| `GET` | `/volunteer/:id` | ✓ | Get public volunteer profile |

#### Matchmaking (`/api/matchmaking`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/matchmaking/projects` | ✓ (Volunteer) | Get skill-matched projects |

#### Participation (`/api/participation`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/participation/request` | ✓ (Volunteer) | Apply to participate in a project |
| `GET` | `/participation/my-applications` | ✓ (Volunteer) | Get my applications |
| `GET` | `/participation/stats` | ✓ (Volunteer) | Get participation statistics |
| `GET` | `/participation/:id` | ✓ (Volunteer) | Get application by ID |
| `PATCH` | `/participation/:id` | ✓ (Volunteer) | Update application |
| `DELETE` | `/participation/:id` | ✓ (Volunteer) | Withdraw application |
| `PATCH` | `/participation/:id/status` | ✓ (NGO) | Approve/reject volunteer |
| `GET` | `/participation/projects/:projectId/volunteers` | ✓ (NGO) | Get project's volunteers |
| `GET` | `/participation/ngo/projects` | ✓ (NGO) | Get NGO projects with volunteer data |

---

### 10. Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | ✓ | Get my notifications (supports `?page=&limit=&unreadOnly=`) |
| `GET` | `/notifications/unread-count` | ✓ | Get unread notification count |
| `PATCH` | `/notifications/read-all` | ✓ | Mark all notifications as read |
| `PATCH` | `/notifications/:id/read` | ✓ | Mark specific notification as read |

---

### 11. News (`/api/corporate/news`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/corporate/news/csr` | ✗ | Get CSR-related news articles |

### 12. Reports (`/api/corporate/reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/corporate/reports/impact` | ✓ (Corporate) | Get corporate impact report |

### 13. Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ✗ | API health check |

**Response:**
```json
{
  "success": true,
  "message": "CrossLink API is running",
  "timestamp": "2026-04-11T06:00:00.000Z"
}
```

---

## 🚀 Deployment

The backend is deployed on **Render** and the frontend on **Vercel**.

📄 **[View full Deployment Guide →](DEPLOYMENT.md)**

| Service | URL |
|---------|-----|
| **Backend API** | `https://crosslink.onrender.com` |
| **Frontend App** | `https://cross-link-rust.vercel.app` |

---

## 🧪 Testing Instructions

The project uses **Playwright** for unit and integration API tests and **Artillery** for performance/load testing.

📄 **[View full Testing Guide →](TESTING.md)**

| Type | Tool | Run Command |
|------|------|-------------|
| Unit tests | Playwright | `npm test` (in `backend/`) |
| Integration tests | Playwright | `npm test` (in `backend/`) |
| Load tests | Artillery | `npm run perf:public` (in `backend/`) |

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | Yes | `5000` | Server port |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/crosslink` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `CLOUD_NAME` | No | — | Cloudinary cloud name |
| `CLOUD_API_KEY` | No | — | Cloudinary API key |
| `CLOUD_API_SECRET` | No | — | Cloudinary API secret |
| `NEWS_API_KEY` | No | — | NewsAPI.org API key |
| `EMAIL_USER` | No | — | Gmail address |
| `EMAIL_PASS` | No | — | Gmail app password |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No (dev proxy) | `/api` | Backend API base URL |
| `VITE_SOCKET_URL` | No | Derived from API URL | WebSocket server URL |

> **Note:** Secrets are never committed to the repository. The `.env` files are in `.gitignore` and only `.env.example` templates are committed.

---

## 🔒 Security

- **Password hashing** — bcryptjs with 10 salt rounds
- **JWT authentication** — 24-hour token expiry, production-enforced strong secret
- **Input sanitization** — express-mongo-sanitize prevents NoSQL injection
- **Rate limiting** — 50 requests/15min on auth endpoints, 3000/15min on API
- **Security headers** — Helmet.js for HTTP headers
- **CORS** — Configurable allowed origins via `FRONTEND_URL`
- **Request size limits** — 2MB body limit to prevent abuse
- **Profile update whitelist** — Only allowed fields can be updated (prevents privilege escalation)
- **File upload validation** — Only image MIME types accepted

---

## 🚨 Troubleshooting

### CORS Errors After Deployment
- Ensure `FRONTEND_URL` on Render matches your **exact** Vercel URL (no trailing slash)
- Multiple origins: `FRONTEND_URL=https://crosslink.vercel.app,https://www.crosslink.vercel.app`

### Render Free Tier Cold Starts
- Free Render services spin down after 15 minutes of inactivity
- First request after cold start takes ~30 seconds
- Use the health check endpoint to "wake up" the service

### MongoDB Connection Issues
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access for Render
- Verify connection string includes database name and `retryWrites=true`

### Image Uploads Not Working
- Verify all three Cloudinary env vars are set (`CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`)
- Max file size: 50MB for project images, 10MB for profile photos

### Email Not Sending
- Enable 2FA on Gmail and create an App Password
- Set `EMAIL_USER` and `EMAIL_PASS` in environment variables

---

## 📄 License

This project is licensed under the ISC License.