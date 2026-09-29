# CareerHub - Modern Job Discovery & Recruitment Platform

CareerHub is a full-stack career and hiring platform connecting job seekers with recruiters in real time. It features responsive job discovery, multi-filter search, application lifecycle management, candidate bookmarking, dark/light theme switching, a dedicated **real-time conversation history and chat system** powered by Socket.IO, **automated database backup & disaster recovery**, **OTP verification & curved sliding authentication**, an **Argon-inspired modular profile system**, and **hardened enterprise-grade security**.

---

## 🌟 Key Features

### 1. Job Discovery & Saved Jobs
- **Dynamic Search & Multi-Filters**: Debounced search by title, skill, company, or keyword, with filters for Category, Work Mode (Remote, Hybrid, Onsite), Experience Level, and Salary/Date sorting.
- **Candidate Bookmarking**: Candidates can save/bookmark jobs with instant state toggling and view them under their profile / saved jobs tab.
- **Interactive Job Cards**: Quick view badges, mode chips, salary tags, application modal trigger, and recruiter insights.

### 2. Recruiter & Candidate Application Pipelines
- **Dedicated Applied Job Viewer (`AppliedJobDetails.jsx`)**: Full job specifications, salary ranges, work mode, company overview, application snapshot, and authentic progress timeline for candidates.
- **Recruiter Applicant Management (`ApplicantDetails.jsx`)**: Filter applicants by posted job, change candidate stages with optional status update notes, inspect attached resumes with one click, and calculate candidate match score.
- **Application Details Page (`/applications/:id`)**: Full-page dedicated inspector with direct recruiter-candidate chat trigger and resume viewer.

### 3. Argon-Inspired Modular Profile System
- **2-Column Responsive Layout**:
  - **Left Column (`ProfileSummary.jsx`)**: Circular avatar with change photo trigger, user identity, role badge, star rating (⭐ 4.8 / 18 reviews), platform statistics, location, department, candidate ID, and role-based quick actions.
  - **Right Column (`ProfilePage.jsx`)**: Sectioned account information cards with inline `[Edit Profile]` $\leftrightarrow$ `[Save Changes]` & `[Cancel]` controls:
    - **Personal Information**: Full Name, Email (read-only), Phone, Account Role (read-only), Department, Enrollment ID.
    - **Contact Information**: Street Address, City, State, Country, Postal Code.
    - **Skills Section**: Interactive skill chips with add/remove tag ability.
    - **About Me**: Bio textarea with character counter.
    - **Candidate Resume Box**: In-modal PDF/document preview (`ResumePreviewModal`), download, replace, and delete actions.

### 4. Interactive Curved Sliding Auth & OTP Security
- **Curved Sliding Card Experience (`AuthPage.jsx`)**:
  - Distinct midnight purple card (`#232050`) with white curved dome arch (`rounded-t-[60px]`).
  - Seamless toggle between Sign up and Login.
  - Field labels with required asterisks (`*`) and silver-grey input backgrounds (`#e0e0e4`).
  - Interactive password visibility toggles (`<FiEye />` / `<FiEyeOff />`).
  - Light mode support with clean `bg-slate-300` background and dark mode `dark:bg-[#151438]`.
- **OTP Verification Component (`OtpVerification.jsx`)**:
  - 6-digit individual PIN input boxes with auto-focus progression, backspace navigation, and clipboard paste support.
  - 60-second dynamic resend timer and integrated with **Forgot Password** and **Reset Password** flows.

### 5. Real-Time Conversation History & Chat
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

### 6. Automated Database Backup & Disaster Recovery
- **Automatic Startup Recovery**: If the MongoDB database is empty or data was dropped/lost, the server automatically restores from the latest available backup snapshot upon startup.
- **Automatic Boot & Scheduled Backups**: Automatically creates a fresh database snapshot whenever the server starts and runs scheduled background backups every 12 hours (configurable).
- **Snapshot Rotation**: Automatically retains the 10 most recent snapshots and cleans up older ones to protect disk space.
- **CLI Commands**: Single-command manual database backups and one-click restores (`npm run db:backup` and `npm run db:restore`).

### 7. Enterprise-Grade Security Hardening
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
- **Animations & Visuals**: GSAP, Recharts, React Hot Toast, React Icons (`react-icons/fi`)

### Backend
- **Runtime & Framework**: Node.js (ES Modules), Express
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Server**: Socket.IO with JWT handshake authentication
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Backup & Recovery**: Native `mongodump` & `mongorestore` automated pipeline
- **File Uploads**: Multer with local disk storage / Cloudinary integration
- **Email Service**: Nodemailer with Gmail SMTP / Custom SMTP transport
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

#### Backend `.env` Configuration (`backend/.env`)

Below is the complete template for `backend/.env`:

```env
# -----------------------------------------------------------------------------
# Server Configuration
# -----------------------------------------------------------------------------
NODE_ENV=development
PORT=5000

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/careerhub
# Or MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careerhub?retryWrites=true&w=majority

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
# Cloudinary Configuration (Optional - falls back to local disk /uploads)
# -----------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# -----------------------------------------------------------------------------
# Email / Nodemailer SMTP Configuration (For OTP Delivery & Verification)
# -----------------------------------------------------------------------------
# Option A: Gmail SMTP (Recommended for development/testing)
# Note: Use a 16-character Google App Password from: https://myaccount.google.com/apppasswords
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM="CareerHub Security" <your_email@gmail.com>

# Option B: Custom SMTP Server (SendGrid, Mailgun, AWS SES, Postmark)
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_USER=your_smtp_username
# SMTP_PASS=your_smtp_password
```

#### Backend Environment Variables Reference

| Variable | Required? | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port on which the Express & Socket.IO server listens. |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, `test`). In production, cookies are flagged `secure` and error details are shielded. |
| `MONGODB_URI` | **Required** | `mongodb://localhost:27017/careerhub` | MongoDB connection URI (local instance or MongoDB Atlas cluster connection string). |
| `JWT_SECRET` | **Required** | — | Long, random cryptographic secret key used to sign and verify JSON Web Tokens. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token lifetime duration string (e.g. `7d`, `24h`, `1h`). |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Allowed origin for frontend client requests and CORS policies. |
| `CLIENT_URL` | Optional | `http://localhost:5173` | Socket.IO client origin whitelist (used for WebSocket handshakes). |
| `AUTO_BACKUP_INTERVAL_HOURS` | Optional | `12` | Frequency in hours to execute automated `mongodump` snapshots. |
| `CLOUDINARY_CLOUD_NAME` | Optional | — | Cloudinary cloud name for uploading resumes and profile avatars. |
| `CLOUDINARY_API_KEY` | Optional | — | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Optional | — | Cloudinary API Secret. |
| `EMAIL_SERVICE` | Optional | `gmail` | Email provider preset for Nodemailer (e.g., `gmail`). |
| `EMAIL_USER` | Optional | — | Email username / sender address for OTP delivery. |
| `EMAIL_PASS` | Optional | — | Email sender password or Google App Password. |
| `EMAIL_FROM` | Optional | `"CareerHub Security" <EMAIL_USER>` | Formatted sender name & address in outgoing mail header. |
| `SMTP_HOST` | Optional | — | Custom SMTP server hostname (if `EMAIL_SERVICE` is not used). |
| `SMTP_PORT` | Optional | `587` | Custom SMTP server port (usually `587` for TLS or `465` for SSL). |
| `SMTP_USER` | Optional | — | Custom SMTP authentication username. |
| `SMTP_PASS` | Optional | — | Custom SMTP authentication password. |

#### Service Setup Guides

<details>
<summary><b>1. Gmail App Password Setup (for real OTP emails)</b></summary>

1. Log into your Google account and navigate to [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already active.
3. Search for **App passwords** or go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Create an app name (e.g., `CareerHub`) and click **Create**.
5. Copy the generated 16-character passcode and paste it into `EMAIL_PASS` in `backend/.env`.
6. Set `EMAIL_USER=your_email@gmail.com` and `EMAIL_SERVICE=gmail`.
</details>

<details>
<summary><b>2. MongoDB Atlas Setup (Cloud Database)</b></summary>

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read and write permissions under **Database Access**.
3. Under **Network Access**, whitelist your IP address or add `0.0.0.0/0` (allow access from anywhere).
4. Click **Connect** $\rightarrow$ **Drivers** (Node.js) and copy the connection string.
5. In `backend/.env`, set:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careerhub?retryWrites=true&w=majority
   ```
</details>

<details>
<summary><b>3. Cloudinary Setup (Cloud Media & Resume Storage)</b></summary>

1. Register a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, copy the **Cloud Name**, **API Key**, and **API Secret**.
3. Populate `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env`.
4. If left blank, CareerHub automatically falls back to local disk storage in `backend/uploads/`.
</details>

---

#### Frontend `.env` Configuration (`frontend/.env`)
```env
# URL pointing to the Backend API server
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Start Development Servers

#### Option A: Run Both Concurrently from Root
```bash
npm run dev
```

#### Option B: Run in Separate Terminals
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
| **Candidate** | `candidate@careerhub.dev` | `password123` |
| **Recruiter** | `recruiter@careerhub.dev` | `password123` |
| **Admin** | `admin@careerhub.dev` | `password123` |

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

### User Profile
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `PATCH` | `/api/profile` | Update profile (bio, phone, address, skills, department, ID, etc.) | Authenticated |
| `POST` | `/api/profile/avatar` | Upload user profile avatar photo (rate limited) | Authenticated |
| `POST` | `/api/profile/resume` | Upload candidate resume document (rate limited) | Authenticated |
| `DELETE` | `/api/profile/resume` | Remove candidate resume document | Authenticated |

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
│   ├── controllers/         # Auth, Job, Application, Conversation, Dashboard, Profile, SavedJobs
│   ├── middleware/          # JWT auth, Role authorization, NoSQL sanitization, Rate limiters
│   ├── models/              # User, Job, Application, Conversation, Message, Notification
│   ├── routes/              # Express API route declarations
│   ├── scripts/             # Backup (backupDb.js) and Restore (restoreDb.js) utilities
│   ├── services/            # Upload service and automated Backup/Recovery service
│   ├── sockets/             # Socket.IO lifecycle, presence, and chat events
│   ├── uploads/             # Local attachments, avatars, and resumes storage
│   ├── .env.example         # Backend environment variables template
│   ├── README.md            # Dedicated backend documentation
│   └── index.js             # HTTP server entry point with graceful shutdown
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client singleton with JWT interceptors
│   │   ├── assets/          # Static illustrations and branding assets
│   │   ├── components/
│   │   │   ├── applications/# AppliedJobDetails, ApplicantDetails, Timeline, StatusBadge, DetailsModal
│   │   │   ├── auth/        # OtpVerification, ProtectedRoute, RoleRoute, LogoutButton
│   │   │   ├── chat/        # ConversationHistory, ChatWindow, MessageBubble, ChatInput, TypingIndicator
│   │   │   ├── common/      # ResumePreviewModal, CustomSelect, StatCard, SectionHeading, LogoMark
│   │   │   ├── dashboard/   # DashboardShell layout
│   │   │   ├── jobs/        # JobCard, JobFilters, SavedJobs
│   │   │   ├── layout/      # SiteHeader, SiteFooter
│   │   │   └── profile/     # ProfileSummary, ProfileStats, ProfileImage, PersonalInformation, ContactInformation, SkillsSection, AboutSection
│   │   ├── context/         # AppContext (Dark theme), SocketContext (Real-time events)
│   │   ├── pages/           # HomePage, JobsPage, JobDetailsPage, ApplicationsPage, ApplicationDetailsPage, MessagesPage, ProfilePage, PostJobPage, SettingsPage, AuthPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── socket/          # Socket.IO client manager
│   │   ├── store/           # Redux Toolkit store and slices
│   │   └── index.css        # Tailwind directives and custom utility classes
│   ├── .env.example         # Frontend environment variables template
│   └── package.json
├── package.json
└── README.md
```

---

## 🧪 Build & Production Deployment

### Build Frontend
```bash
# Build Frontend Bundle from root
npm run build

# Or directly in frontend folder
cd frontend
npm run build
```

### Preview Frontend Build
```bash
cd frontend
npm run preview
```

### Run Backend in Production
```bash
cd backend
NODE_ENV=production node index.js
```
