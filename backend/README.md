# CareerHub - Backend API & Real-Time Service

The CareerHub Backend is an enterprise-grade RESTful API and WebSocket real-time messaging engine built with Node.js (ES Modules), Express, MongoDB (Mongoose), and Socket.IO.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Environment Configuration (`.env`)](#-environment-configuration-env)
- [Directory Structure](#-directory-structure)
- [Scripts & Utilities](#-scripts--utilities)
- [Database Setup & Backups](#-database-setup--backups)
- [Email Service & OTPs](#-email-service--otps)
- [REST API Reference](#-rest-api-reference)
- [Socket.IO Events](#-socketio-events)

---

## 🛠 Architecture & Tech Stack

- **Runtime & Web Framework**: Node.js (ES Modules) & Express 4.x
- **Database**: MongoDB with Mongoose ODM
- **Real-Time WebSockets**: Socket.IO with JWT handshake authentication
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies and bcryptjs password hashing
- **Email Service**: Nodemailer (Gmail SMTP & Custom SMTP) for OTP account verification & password reset
- **Disaster Recovery**: Automated snapshot backups using `mongodump` & `mongorestore` with auto-rotation
- **File Storage**: Multer with local disk uploads (`/uploads`) and optional Cloudinary CDN integration
- **Security Hardening**:
  - Helmet HTTP security headers
  - CORS origin isolation
  - Recursive NoSQL injection sanitization middleware
  - Endpoint-specific rate limiting (`express-rate-limit`)
  - Strict file MIME & extension whitelisting

---

## ⚙️ Environment Configuration (`.env`)

The backend configuration is managed through a `.env` file located in `backend/.env`.

### 1. Create `.env` from the template

```bash
cp .env.example .env
```

### 2. Complete `.env` Template

```env
# -----------------------------------------------------------------------------
# Server Environment
# -----------------------------------------------------------------------------
NODE_ENV=development
PORT=5000

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/careerhub

# Or MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careerhub?retryWrites=true&w=majority

# -----------------------------------------------------------------------------
# Authentication & Security
# -----------------------------------------------------------------------------
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

# -----------------------------------------------------------------------------
# Client Origins & CORS Whitelist
# -----------------------------------------------------------------------------
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# -----------------------------------------------------------------------------
# Automated Disaster Recovery & Backups
# -----------------------------------------------------------------------------
AUTO_BACKUP_INTERVAL_HOURS=12

# -----------------------------------------------------------------------------
# Cloudinary Configuration (Optional - falls back to local /uploads if not set)
# -----------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# -----------------------------------------------------------------------------
# Email / Nodemailer SMTP Configuration (For OTP Delivery & Verification)
# -----------------------------------------------------------------------------
# Option A: Gmail SMTP (Use Google App Password from: https://myaccount.google.com/apppasswords)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM="CareerHub Security" <your_email@gmail.com>

# Option B: Custom SMTP Server (SendGrid, Mailgun, AWS SES, Postmark)
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_password
```

### 3. Environment Variables Reference

| Variable | Required | Default | Purpose / Details |
|---|:---:|:---:|---|
| `PORT` | No | `5000` | Port number on which the Express and Socket.IO server binds. |
| `NODE_ENV` | No | `development` | Runtime mode: `development`, `production`, or `test`. Affects logging verbosity, cookie `secure` flags, and error stack shielding. |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/careerhub` | MongoDB connection string. Can be a local connection or a MongoDB Atlas cloud URI. |
| `JWT_SECRET` | **Yes** | — | Secret string used for signing and verifying user JWT tokens. Must be a strong random string. |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry timeframe (e.g. `7d`, `24h`, `30d`). |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed frontend client URL for Express CORS handling. |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed client origin for Socket.IO WebSocket handshakes. |
| `AUTO_BACKUP_INTERVAL_HOURS` | No | `12` | Interval in hours between scheduled automatic database backups. |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud identifier for remote cloud storage. |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API access key. |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API access secret. |
| `EMAIL_SERVICE` | No | `gmail` | Preset provider for Nodemailer (e.g. `gmail`). |
| `EMAIL_USER` | No | — | Sender email address for OTP deliveries. |
| `EMAIL_PASS` | No | — | Email sender password or 16-character Google App Password. |
| `EMAIL_FROM` | No | `"CareerHub Security" <EMAIL_USER>` | Formatted email sender header. |
| `SMTP_HOST` | No | — | Host for custom SMTP server (e.g. `smtp.mailgun.org`). |
| `SMTP_PORT` | No | `587` | Port for custom SMTP server (`587` for STARTTLS, `465` for SSL). |
| `SMTP_USER` | No | — | Username for custom SMTP server. |
| `SMTP_PASS` | No | — | Password for custom SMTP server. |

---

## 📁 Directory Structure

```text
backend/
├── config/              # Centralized configuration modules
│   ├── app.js           # Express app setup, middlewares, CORS, Helmet, error handlers
│   ├── cloudinary.js    # Cloudinary SDK configuration
│   ├── db.js            # MongoDB connection lifecycle & automated backup triggers
│   ├── env.js           # Environment fallback definitions
│   └── upload.js        # Multer disk/memory storage config & file filters
├── controllers/         # Request handling & business logic
│   ├── authController.js        # User register, login, OTP verification, password reset
│   ├── jobController.js         # Jobs CRUD, multi-filter search, recruiter listings
│   ├── applicationController.js # Job application submissions & pipeline stage tracking
│   ├── conversationController.js# Real-time chat history & message persistence
│   ├── profileController.js     # User profile updates, resume/avatar file uploads
│   ├── savedJobsController.js   # Candidate job bookmarks
│   └── dashboardController.js   # Analytics & platform statistics
├── middleware/          # Express route middlewares
│   ├── auth.js          # JWT token verification & user context injection
│   ├── checkRole.js     # Role-based authorization ('candidate', 'recruiter', 'admin')
│   ├── sanitize.js      # Recursive NoSQL query injection prevention
│   └── rateLimiter.js   # Rate limiters for auth and media upload routes
├── models/              # Mongoose data models
│   ├── User.js          # User schema, password hashing, roles, OTP fields
│   ├── Job.js           # Job post schema, filters, salary, location
│   ├── Application.js   # Application pipeline, status timeline, notes
│   ├── Conversation.js  # Chat conversations mapped to applications
│   ├── Message.js       # Chat messages, attachments, read receipts
│   └── Notification.js # In-app notification alerts
├── routes/              # Express API route modules
├── scripts/             # Maintenance and database scripts
│   ├── backupDb.js      # Manual database backup trigger
│   ├── restoreDb.js     # Database restore utility
│   └── cleanJobs.js     # Database cleanup utility
├── services/            # Background & third-party services
│   ├── backupService.js # Automated mongodump/mongorestore scheduler & rotation
│   ├── mailService.js   # Nodemailer email transport & HTML OTP mail templates
│   └── uploadService.js # Multer/Cloudinary stream handler
├── sockets/             # Socket.IO handlers
│   └── chatSocket.js    # Connection lifecycle, typing indicators, live messages
├── uploads/             # Local storage for avatars, resumes, and attachments
├── .env                 # Active environment variables (gitignored)
├── .env.example         # Environment template
├── package.json         # Backend dependencies and scripts
└── index.js             # HTTP & Socket.IO server startup entry point
```

---

## 📜 Scripts & Utilities

Run these scripts from within the `backend/` folder:

| Command | Action |
|---|---|
| `npm run dev` | Start development server with file watch mode (`node --watch index.js`) |
| `npm start` | Start server in production mode |
| `npm run db:backup` | Execute an immediate `mongodump` database snapshot to `backend/backups/` |
| `npm run db:restore` | Restore database from the most recent backup snapshot |
| `npm run db:clean-jobs` | Run database cleanup script |

---

## 💾 Database Setup & Backups

### 1. Automated Backups & Startup Recovery
- **Automatic Startup Recovery**: When the server launches, if the target MongoDB database is empty, it automatically locates the most recent backup snapshot in `backend/backups/` and executes `mongorestore`.
- **Scheduled Backups**: Backups run automatically every `AUTO_BACKUP_INTERVAL_HOURS` (default: 12 hours).
- **Snapshot Retention**: Automatically preserves the 10 most recent backups and purges older ones to preserve disk space.

### 2. Manual Backup & Restore
```bash
# Take a manual snapshot
node scripts/backupDb.js

# Restore from latest snapshot
node scripts/restoreDb.js

# Restore from a specific snapshot folder
node scripts/restoreDb.js backend/backups/backup_2026-09-21T05-47-18-743Z
```

---

## 📧 Email Service & OTPs

CareerHub sends real OTP verification codes to users during registration, forgot password, and reset password flows using **Nodemailer**.

### Using Gmail SMTP:
1. Turn on **2-Step Verification** on your Google Account: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Update `backend/.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_digit_app_password
   EMAIL_FROM="CareerHub Security" <your_email@gmail.com>
   ```

---

## 📡 REST API Reference

All REST endpoints are prefixed with `/api`.

- `/api/auth` — Registration, Login, Logout, Profile verification, Refresh token, Forgot/Reset password
- `/api/profile` — Profile data, Avatar upload, Resume upload & removal
- `/api/jobs` — Job listings, filters, job creation, editing, deletion
- `/api/saved-jobs` — Candidate bookmarks
- `/api/applications` — Candidate job applications, pipeline stages, status updates
- `/api/conversations` — Direct messaging history, message read receipts
- `/api/upload` — File & attachment upload endpoint

---

## ⚡ Socket.IO Events

The Socket.IO server authenticates connections via JWT handshake token.

- `connection`: Authenticates and joins user-specific room
- `join_conversation` / `leave_conversation`: Join/leave chat rooms
- `send_message`: Emits new message and persists to database
- `receive_message`: Real-time broadcast to room participants
- `typing` / `stop_typing`: Real-time animated typing indicator
- `mark_as_read` / `messages_marked_read`: Real-time read receipt updates
- `user_status_changed` / `online_users_list`: Live presence tracking
