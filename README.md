# RealTimeChat

A simple, modern real‑time chat application with authentication, presence, file uploads, and typing/read updates.  
Frontend is built with **Vite + React + TypeScript**. Backend is **Node.js (Express 5) + Socket.IO + Sequelize (SQLite)**.

> This README was generated from the current project structure (September 2025). If you change files or scripts, update the docs accordingly.

---

## ✨ Features

- 🔐 **JWT auth** (register, login, profile)
- 💬 **1‑to‑1 conversations** with read receipts
- ⚡ **Real‑time messages** via Socket.IO
- 👀 **Presence** (online / offline, last seen)
- 📎 **File upload** (Multer, stored under `backend/uploads`)
- 🎨 **Light/Dark theme** preference per user
- 🧪 **Seed script** to populate demo users (Alice, Bob, Charlie)
- 🗂️ SQLite database file (no server required by default)

---

## 🧱 Tech Stack

**Frontend**
- Vite, React, TypeScript
- Tailwind (via CDN in `frontend/index.html`)
- Socket.IO Client

**Backend**
- Express 5
- Passport (JWT)
- Sequelize (SQLite by default)
- Socket.IO
- Multer (uploads)
- bcryptjs, jsonwebtoken, cors

---

## 📦 Monorepo layout

```
RealTimeChat/
├─ .env                         # shared config (read by backend & Vite)
├─ package.json                 # frontend (Vite) scripts & deps
├─ vite.config.ts               # Vite config (root is ./frontend)
├─ frontend/
│  ├─ index.html
│  ├─ login.html, register.html
│  ├─ css/
│  └─ js/                       # React + TS app
│     ├─ index.tsx
│     ├─ App.tsx
│     ├─ components/*.tsx
│     ├─ context/AuthContext.tsx
│     ├─ services/apiClient.ts
│     └─ types.ts
└─ backend/
   ├─ server.js                 # Express + Socket.IO server
   ├─ package.json              # backend scripts & deps
   ├─ config/config.js
   ├─ controllers/*.js
   ├─ middleware/*.js
   ├─ models/                   # Sequelize models
   ├─ routes/                   # REST endpoints
   ├─ services/
   │  ├─ seed.js                # demo data
   │  ├─ socket.js              # websocket handlers
   │  └─ conversationService.js
   └─ uploads/                  # file uploads (generated)
```

---

## ⚙️ Prerequisites

- **Node.js 18+** (recommended 20+)
- **npm** 9+
- No DB server required (uses SQLite file at `backend/database.sqlite`)

---

## 🔧 Configuration

Create `.env` in the project root (already included in your zip). Defaults shown below:

```ini
PORT=5000
SECRET_KEY=change_me              # replace in production
DB_PATH=backend/database.sqlite
UPLOAD_DIR=backend/uploads
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

- `PORT` — backend HTTP port
- `CLIENT_ORIGIN` — CORS origin allowed by backend
- `VITE_API_URL` — frontend base URL for API (must match backend URL)

> **Note:** `SECRET_KEY` is used to sign JWTs. Always change it in production.

---

## 🚀 Quick Start (Dev)

Open **two terminals** from the project root.

**1) Backend**

```bash
cd backend
npm install
# optional: seed demo users & chats
npm run seed
# run dev server with nodemon (http://localhost:5000)
npm run dev
```

**2) Frontend**

```bash
# from the repo root
npm install
# run Vite dev server (http://localhost:5173)
npm run dev
```

Login with **seeded users** after running `npm run seed`:

- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `charlie@example.com` / `password123`

---

## 🛣️ REST API (summary)

Base URL: `http://localhost:5000`

### Auth
- `POST /auth/register` — `{ firstName, lastName, email, password }`
- `POST /auth/login` — `{ email, password }` → `{ token, user }`
- `GET /auth/me` — (Bearer token) → current user
- `PATCH /auth/preferences` — `{ theme?, backgroundUrl? }`

### Conversations
- `GET /conversations` — list user’s conversations
- `POST /conversations` — `{ userId }` → create (or return existing)
- `PATCH /conversations/:id/mark-read` — mark as read

### Messages
- `GET /messages/:conversationId` — list messages
- `POST /messages/:conversationId` — `{ content?, fileUrl?, fileName?, fileType? }`

### Uploads
- `POST /upload` — `multipart/form-data` field **file** → `{ fileUrl, fileName, fileType }`

> All protected routes require `Authorization: Bearer <JWT>`

---

## 🔌 WebSocket (Socket.IO)

Connect to the backend using the JWT (either in `auth` or in `Authorization` header):

```ts
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: jwtToken }, // or headers: { Authorization: `Bearer ${jwtToken}` }
});
```

**Events (server ↔ client)**

- `conversation:join` — join a conversation room
- `conversation:leave` — leave a conversation room
- `message:send` — send a message (with text or file)
- `message:read` — notify read status
- `conversation:updated` — conversation metadata changed (read flags, last message)
- `user:status` — presence updates for participants (online/offline/lastSeen)

---

## 🧰 Available Scripts

### Frontend (root `package.json`)
- `npm run dev` — start Vite dev server
- `npm run build` — build to `frontend/dist`
- `npm run preview` — preview production build

### Backend (`backend/package.json`)
- `npm run dev` — start backend with nodemon
- `npm run start` — start backend (node)
- `npm run seed` — reset DB & load demo data

---

## 🛠️ Deployment Notes

- For simple deployments, keep SQLite and ensure `DB_PATH` points to a writable location.
- To use **PostgreSQL** or **MySQL**, update the Sequelize initialization in `backend/models/index.js` and add the corresponding driver package.
- Serve the frontend (built assets) from a static host (e.g., Netlify, Vercel, Nginx) and point `VITE_API_URL` to your backend URL.
- Configure **CORS** via `CLIENT_ORIGIN` in `.env` (can be a comma‑separated list if you extend the code).

---

## 🧯 Troubleshooting

- **MongoDB connection error** — This project uses **SQLite** with Sequelize. Make sure you are running the code from this repository (`backend/server.js`), not from a different Mongo/Express project. Ensure `DB_PATH` is valid and writable.
- **CORS errors** — Check that `CLIENT_ORIGIN` matches the Vite dev URL (default `http://localhost:5173`). Restart backend after changes.
- **Token missing** — Verify that the frontend is sending `Authorization: Bearer <JWT>` in REST and the Socket.IO `auth.token` on connect.
- **Uploads failing** — Ensure `UPLOAD_DIR` exists (it is auto‑created) and your request uses `multipart/form-data` with field name `file`.

---

## 📜 License

MIT (or your preferred license). Update this section if you choose a different license.

---

## 👏 Credits

- Initial scaffolding with Vite + React + TS
- Backend built with Express 5, Sequelize, and Socket.IO
- Generated README authored with the help of ChatGPT
