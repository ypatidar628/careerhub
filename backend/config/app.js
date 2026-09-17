import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import routes from "../routes/index.js";

const app = express();
const allowedOrigin =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", routes);
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ message: "File is too large." });
  res.status(500).json({ message: "Something went wrong." });
});

export default app;
