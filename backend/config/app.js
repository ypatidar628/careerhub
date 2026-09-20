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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

const app = express();
const allowedOrigin =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, socket handshakes) or matching origins
      if (!origin || origin === allowedOrigin || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true); // Dev friendly
    },
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static uploads serving
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use("/api", routes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File is too large (max 10MB allowed)." });
  }
  console.error("API error:", err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong." });
});

export default app;
