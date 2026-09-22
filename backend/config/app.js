import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import routes from "../routes/index.js";
import { mongoSanitize } from "../middleware/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

const app = express();

const clientOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

// 1. Helmet Security Headers (Configured for cross-origin document & media embedding)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  }),
);

// 2. Strict CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS request blocked by security policy."));
    },
    credentials: true,
  }),
);

// 3. Global Rate Limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
  }),
);

// 4. Request Logging & Body Parsers
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// 5. NoSQL Injection & Query Sanitization
app.use(mongoSanitize);

// 6. Static uploads serving (with secure caching headers)
app.use(
  "/uploads",
  express.static(uploadsDir, {
    dotfiles: "ignore",
    maxAge: "1d",
  }),
);

// 7. API Routes
app.use("/api", routes);

// 8. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// 9. Global Error Handler (Sanitizes error leaks in production)
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File is too large (max 10MB allowed)." });
  }

  const isDev = process.env.NODE_ENV !== "production";
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode === 500 && !isDev) {
    console.error("Internal Server Error:", err);
    return res.status(500).json({ message: "An unexpected internal server error occurred." });
  }

  res.status(statusCode).json({
    message: err.message || "Something went wrong.",
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
});

export default app;
