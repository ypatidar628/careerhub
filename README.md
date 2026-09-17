<<<<<<< HEAD
# careerhub
=======
# CareerHub

CareerHub is a full-stack career and hiring platform with a responsive React application and a production-oriented Express API. The backend has been refactored to a cleaner structure, with MongoDB connectivity, model validation, role-based access, and environment-driven configuration while preserving the existing frontend API contract.

## Stack

- Frontend: React, Vite, React Router, Redux Toolkit, React Hook Form + Zod, Tailwind, Recharts, GSAP, Axios, React Hot Toast.
- Backend: Express (ES modules), Mongoose, MongoDB, JWT, bcryptjs, Helmet, CORS, rate limiting, Multer, and Cloudinary.

## Install and run

Requirements: Node.js 18+ and npm.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. `npm run build` creates a production frontend build. Run `npm run lint --prefix frontend` for linting.

Set a long unique `JWT_SECRET` in `backend/.env` and provide a valid `MONGODB_URI` for your local instance or MongoDB Atlas. For uploads, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Without them, upload routes return a clear `503` and the frontend retains its local avatar preview.

## Development-only demo accounts

| Role | Email | Password |
|---|---|---|
| Candidate | candidate@careerhub.dev | password123 |
| Recruiter | recruiter@careerhub.dev | password123 |
| Admin | admin@careerhub.dev | password123 |

## API

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/jobs`, `/api/jobs/:id` | Public |
| GET | `/api/notifications`, `/api/messages`, `/api/dashboard` | Authenticated |
| POST | `/api/profile/avatar`, `/api/profile/resume` | Authenticated |

Authentication is kept in a seven-day HTTP-only cookie, with Bearer-token support for API clients. The backend now initializes a MongoDB connection on startup and keeps the project ready for a real persistence layer without breaking the existing frontend API contract. In production, set HTTPS, a restrictive `FRONTEND_URL`, strong secrets, and non-demo users; do not use development credentials.

## Layout

```
frontend/  React application
backend/   Express + Mongoose API
```

## Refactor notes

- Existing Express routes and response contracts were kept intact.
- Database access is centralized in `backend/config/db.js` and Mongoose models.
- User, job, and application repositories now support MongoDB-backed persistence while keeping the current API behavior stable.
- The project is ready for further service/controller decomposition and schema expansion as the app grows.
>>>>>>> 8b1acfe (Initial CareerHub application)
