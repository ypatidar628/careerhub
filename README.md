# CareerHub - Modern Job Discovery & Recruitment Platform

CareerHub is a full-stack career and hiring platform connecting job seekers with recruiters in real time. It features responsive job discovery, multi-filter search, application lifecycle management, candidate bookmarking, dark/light theme switching, a dedicated **real-time conversation history and chat system** powered by Socket.IO, **automated database backup & disaster recovery**, and **hardened enterprise-grade security**.

---

## 🌟 Key Features

### 1. Job Discovery & Saved Jobs
- **Dynamic Search & Multi-Filters**: Debounced search by title, skill, company, or keyword, with filters for Category, Work Mode (Remote, Hybrid, Onsite), Experience Level, and Salary/Date sorting.
- **Candidate Bookmarking**: Candidates can save/bookmark jobs with instant state toggling and view them under their profile / saved jobs tab.
- **Interactive Job Cards**: Quick view badges, mode chips, salary tags, application modal trigger, and recruiter insights.

### 2. Recruiter & Candidate Application Pipelines
- **Pipeline Tracking**: Visual status timeline (`Applied` → `Under Review` → `Shortlisted` → `Interview` → `Selected` / `Rejected`).
- **Recruiter Applicant Management**: Filter applicants by posted job, change candidate stages with optional status update notes, and inspect attached resumes with one click.
- **Application Details Inspector**: Detailed modal with candidate profile, resume preview, match score, cover letter, and direct chat trigger.

### 3. Real-Time Conversation History & Chat
- **Two-Panel Conversation History (`/messages`)**:
  - **Left Panel**: Searchable conversation list by candidate name, recruiter name, job title, company, and message text, showing live online/offline presence (`🟢`/`⚪`), last message preview, timestamps, and animated unread badges.
  - **Right Panel (Chat Window)**: Sticky header with user presence and "View Application" button, application context card, date separators (`Today`, `Yesterday`), and smart auto-scroll with floating `↓ New messages` button.
- **Modern Message Bubbles**:
  - Compact layout with distinct incoming/outgoing styling.
  - Image attachments with lightbox modal preview.
  - Document attachments (PDF, DOC, DOCX <= 10MB) with download button and formatted file sizes.
  - Hover actions: Copy message text and Reply to quote previous messages.
  - Read status ticks (`✓` sent, `✓✓` read).
- **Interactive Features**:
  - Real-time animated typing indicator (`Rahul is typing...`).
  - Sticky composer with <kbd>Enter</kbd> (send), <kbd>Shift</kbd>+<kbd>Enter</kbd> (new line), inline emoji selector, and file uploader.
  - Mobile responsive: seamless toggle between conversation list and full-width chat screen.

### 4. Automated Database Backup & Disaster Recovery
- **Automatic Startup Recovery**: If the MongoDB database is empty or data was dropped/lost, the server automatically restores from the latest available backup snapshot upon startup.
- **Automatic Boot & Scheduled Backups**: Automatically creates a fresh database snapshot whenever the server starts and runs scheduled background backups every 12 hours (configurable).
- **Snapshot Rotation**: Automatically retains the 10 most recent snapshots and cleans up older ones to protect disk space.
- **CLI Commands**: Single-command manual database backups and one-click restores (`npm run db:backup` and `npm run db:restore`).

### 5. Enterprise-Grade Security Hardening
- **NoSQL Injection Defense**: Recursive query sanitization middleware stripping dangerous MongoDB operator keys (`$`, `.`) from request bodies, parameters, and query strings.
- **Brute-Force & DoS Protection**: Dedicated strict rate limiters for authentication endpoints (`/auth/login`, `/auth/register`) and file upload routes.
- **Privilege Escalation Protection**: Public registration strictly restricts roles to `"candidate"` or `"recruiter"` (rejects unauthorized `admin` role elevation).
- **Input Sanitization & Normalization**: Automated email normalization (trim, lowercase, regex validation) and password policy enforcement.
- **File Upload Security**: Strict MIME-type and extension whitelisting (`.jpg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx`) preventing malicious script/executable execution.
- **Production Error Shielding**: Masks sensitive internal stack traces and database error details in production responses.
- **HTTP Security Headers & CORS Isolation**: Comprehensive `helmet` policy and origin whitelisting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **State Management**: Redux Toolkit, Context API (`AppContext`, `SocketContext`)
- **Styling**: Tailwind CSS, Material UI icons & tooltip, custom CSS variables
- **Real-Time Client**: `socket.io-client`
- **Forms & Validation**: React Hook Form, Zod
- **Animations & Visuals**: GSAP, Recharts, React Hot Toast

### Backend
- **Runtime & Framework**: Node.js (ES Modules), Express
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Server**: Socket.IO with JWT handshake authentication
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Backup & Recovery**: Native `mongodump` & `mongorestore` automated pipeline
- **File Uploads**: Multer with local disk storage / Cloudinary integration
- **Security**: Helmet, CORS, NoSQL sanitization, rate limiting, and graceful shutdown handlers

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI
- **MongoDB Database Tools**: `mongodump` & `mongorestore` (for database backup/restore)

### 1. Clone & Configure Environment

```bash
# Clone the repository
git clone <repository-url>
cd carrerHub

# Configure Backend Environment
cp backend/.env.example backend/.env

# Configure Frontend Environment
cp frontend/.env.example frontend/.env
```

#### Backend `.env` Configuration
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerhub
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
AUTO_BACKUP_INTERVAL_HOURS=12

# Optional: Cloudinary for cloud media storage (falls back to local /uploads if not set)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Environment Variables Reference

| Variable | Scope | Required | Default / Example | Description |
|---|---|---|---|---|
| `NODE_ENV` | Backend | No | `development` | Application environment (`development` or `production`) |
| `PORT` | Backend | No | `5000` | Port for Express REST API & Socket.IO server |
| `MONGODB_URI` | Backend | **Yes** | `mongodb://localhost:27017/careerhub` | MongoDB connection URI |
| `JWT_SECRET` | Backend | **Yes** | `replace-with-a-long-random-secret` | Secret key used to sign & verify JWT tokens |
| `JWT_EXPIRES_IN` | Backend | No | `7d` | Token expiry duration (e.g. `7d`, `24h`) |
| `AUTO_BACKUP_INTERVAL_HOURS` | Backend | No | `12` | Background auto-backup interval in hours |
| `FRONTEND_URL` | Backend | No | `http://localhost:5173` | Frontend client origin allowed by CORS and Socket.IO |
| `CLIENT_URL` | Backend | No | `http://localhost:5173` | Secondary client URL alias for CORS |
| `CLOUDINARY_CLOUD_NAME` | Backend | No | `""` | Cloudinary cloud name for file uploads |
| `CLOUDINARY_API_KEY` | Backend | No | `""` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | No | `""` | Cloudinary API secret key |
| `VITE_API_URL` | Frontend | **Yes** | `http://localhost:5000` | Base backend API endpoint URL |

#### Frontend `.env` Configuration
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Install backend packages
npm install --prefix backend

# Install frontend packages
npm install --prefix frontend
```

### 3. Start Development Servers

```bash
# Terminal 1: Run Backend API & Socket.IO (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend Vite Dev Server (Port 5173)
cd frontend
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API & WebSockets**: `http://localhost:5000`

---

## 💾 Database Backup & Disaster Recovery

The project comes with built-in backup and disaster recovery tools:

```bash
# Take a manual database backup snapshot
npm run --prefix backend db:backup

# Restore database from the latest backup snapshot
npm run --prefix backend db:restore

# Restore from a specific backup snapshot
node backend/scripts/restoreDb.js backend/backups/backup_2026-09-21T05-47-18-743Z
```

*Backups are saved to `backend/backups/` and automatically excluded from git commits.*

---

## 👥 Demo Test Accounts

| Role | Email | Password |
|---|---|---|
| **Candidate** | `candidate@careerhub.dev` | `Password123!` |
| **Recruiter** | `recruiter@careerhub.dev` | `Password123!` |
| **Admin** | `admin@careerhub.dev` | `Password123!` |

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register candidate or recruiter (rate limited) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token (rate limited) | Public |
| `POST` | `/api/auth/logout` | Clear authentication cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/auth/refresh` | Refresh user authentication session | Authenticated |

### Jobs Discovery & Management
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/jobs` | Discover jobs with search, category, mode, & experience filters | Public |
| `GET` | `/api/jobs/:id` | Get single job details | Public |
| `GET` | `/api/jobs/mine` | List jobs posted by current recruiter | Recruiter |
| `POST` | `/api/jobs` | Post a new job | Recruiter |
| `PATCH` | `/api/jobs/:id` | Edit existing job | Recruiter |
| `DELETE` | `/api/jobs/:id` | Delete job posting | Recruiter |

### Saved Jobs (Bookmarks)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/saved-jobs` | List all saved jobs for current candidate | Candidate |
| `GET` | `/api/saved-jobs/ids` | Get array of saved job IDs | Candidate |
| `POST` | `/api/saved-jobs/:id` | Save/bookmark a job | Candidate |
| `DELETE` | `/api/saved-jobs/:id` | Remove job from saved list | Candidate |

### Applications & Pipeline
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/jobs/:jobId/applications` | Submit application with cover letter & resume | Candidate |
| `GET` | `/api/applications/mine` | List submitted applications for candidate | Candidate |
| `GET` | `/api/applications` | List applicant pipeline with job/status filters | Recruiter / Admin |
| `GET` | `/api/applications/:id` | Get single application details | Authenticated |
| `PATCH` | `/api/applications/:id` | Update applicant stage (Applied, Review, Interview, etc.) | Recruiter / Admin |
| `PATCH` | `/api/applications/:id/withdraw` | Withdraw candidate application | Candidate |

### Real-Time Chat & Conversations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/conversations` | List user conversations with unread counters & details | Authenticated |
| `GET` | `/api/conversations/:id` | Get single conversation details | Authenticated |
| `GET` | `/api/conversations/application/:applicationId` | Fetch conversation linked to an application | Authenticated |
| `POST` | `/api/applications/:applicationId/conversation` | Idempotent find/create conversation for application | Authenticated |
| `GET` | `/api/conversations/:id/messages` | Retrieve conversation message history & mark read | Authenticated |
| `POST` | `/api/conversations/:id/messages` | Send a message with optional file attachments | Authenticated |
| `PATCH` | `/api/conversations/:id/read` | Mark conversation messages as read | Authenticated |
| `POST` | `/api/upload/attachment` | Upload document or image <= 10MB (rate limited) | Authenticated |

---

## ⚡ Socket.IO Events Reference

| Event Name | Direction | Payload / Description |
|---|---|---|
| `connection` | Client → Server | Connect with JWT handshake auth |
| `user_status_changed` | Server → Client | Broadcasts user online/offline presence |
| `online_users_list` | Server → Client | Array of active online user IDs |
| `join_conversation` | Client → Server | `{ conversationId }` - Join conversation room |
| `leave_conversation` | Client → Server | `{ conversationId }` - Leave conversation room |
| `send_message` | Client → Server | `{ conversationId, text, attachments }` |
| `receive_message` | Server → Client | `{ conversationId, message }` in real-time |
| `new_message_notification` | Server → Client | Real-time notification for participants outside room |
| `typing` / `typing_start` | Client → Server | Broadcast typing indicator to conversation room |
| `stop_typing` / `typing_stop` | Client → Server | Clear typing indicator |
| `mark_as_read` | Client → Server | `{ conversationId }` - Mark unread messages |
| `messages_marked_read` | Server → Client | `{ conversationId, readByUserId }` |

---

## 📁 Project Structure

```text
carrerHub/
├── backend/
│   ├── config/              # App, Database, Env, and Multer upload configurations
│   ├── controllers/         # Auth, Job, Application, Conversation, Dashboard, SavedJobs
│   ├── middleware/          # JWT auth, Role authorization, NoSQL sanitization, Rate limiters
│   ├── models/              # User, Job, Application, Conversation, Message, Notification
│   ├── routes/              # Express API route declarations
│   ├── scripts/             # Backup (backupDb.js) and Restore (restoreDb.js) utilities
│   ├── services/            # Upload service and automated Backup/Recovery service
│   ├── sockets/             # Socket.IO lifecycle, presence, and chat events
│   ├── uploads/             # Local attachments, avatars, and resumes storage
│   └── index.js             # HTTP server entry point with graceful shutdown
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client singleton with JWT interceptors
│   │   ├── assets/          # Static illustrations and branding assets
│   │   ├── components/
│   │   │   ├── applications/# Timeline, StatusBadge, ApplicationDetailsModal
│   │   │   ├── auth/        # ProtectedRoute, RoleRoute, LogoutButton
│   │   │   ├── chat/        # ConversationHistory, ChatWindow, MessageBubble, ChatInput, TypingIndicator, FileUploader, chat.css
│   │   │   ├── common/      # CustomSelect, StatCard, SectionHeading, LogoMark
│   │   │   ├── dashboard/   # DashboardShell layout
│   │   │   ├── jobs/        # JobCard, JobFilters, SavedJobs
│   │   │   └── layout/      # SiteHeader, SiteFooter
│   │   ├── context/         # AppContext (Dark theme), SocketContext (Real-time events)
│   │   ├── pages/           # HomePage, JobsPage, JobDetailsPage, ApplicationsPage, MessagesPage, ProfilePage, PostJobPage, SettingsPage, AuthPage
│   │   ├── socket/          # Socket.IO client manager
│   │   ├── store/           # Redux Toolkit store and slices
│   │   └── index.css        # Tailwind directives and custom utility classes
│   └── package.json
└── README.md
```

---

## 🧪 Build & Production Deployment

```bash
# Build Frontend Bundle
cd frontend
npm run build

# Preview Production Build
npm run preview
```

To run the backend in production:
```bash
cd backend
NODE_ENV=production node index.js
```
