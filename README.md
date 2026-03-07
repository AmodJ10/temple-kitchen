# 🙏 MSM Kitchen — Seva Management System

A full-stack web application for managing temple kitchen operations: event planning, dish management, vendor procurement, volunteer attendance, inventory tracking, meetings, tasks, and reporting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Query, Framer Motion |
| Backend | Node.js 20+, Express.js, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT (httpOnly cookies) |
| Real-time | Socket.io |
| File Upload | Cloudinary |

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free M0 cluster)

### 1. Clone & Install
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
cd shared && npm install && cd ..
```

### 2. Configure Environment
Copy `.env.example` to `server/.env` and fill in:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — random secure strings
- `CLOUDINARY_*` — your Cloudinary credentials (optional for dev)

### 3. Run Development
```bash
npm run dev
```
This starts both server (port 5000) and client (port 5173) concurrently.

### 4. Access
Open `http://localhost:5173` — create an account and start managing events!

## Project Structure
```
temple-kitchen-app/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios + API endpoints
│       ├── components/  # UI + Layout components
│       ├── pages/       # Route page components
│       ├── store/       # Zustand state stores
│       ├── styles/      # Global CSS + design system
│       └── utils/       # Formatters, constants
├── server/          # Express backend
│   └── src/
│       ├── config/      # DB, Cloudinary, Socket.io
│       ├── controllers/ # Route handlers
│       ├── middleware/   # Auth, validation, errors
│       ├── models/      # Mongoose schemas
│       ├── routes/      # Express routes
│       ├── services/    # Business logic
│       └── utils/       # ApiError, ApiResponse
├── shared/          # Shared Zod validation schemas
└── package.json     # Root monorepo scripts
```

## Features (Phase 1 — Complete)
- ✅ Authentication (JWT + httpOnly cookies)
- ✅ Master Sevekari (volunteer) database
- ✅ Master Inventory with stock tracking
- ✅ Vendor management
- ✅ Event creation with auto-generated day documents
- ✅ Event detail with tabbed interface
- ✅ Dashboard with metrics & quick actions
- ✅ Dark mode support
- ✅ Responsive design (mobile + desktop)
- ✅ Beautiful saffron/green temple-inspired theme
