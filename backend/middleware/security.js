import rateLimit from "express-rate-limit";

/**
 * Strips dangerous MongoDB operator keys ($ and .) recursively to prevent NoSQL Injection
 */
export const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Drop keys starting with $ or containing . (MongoDB query operators / path injection)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    sanitized[key] = typeof value === "object" && value !== null ? sanitizeData(value) : value;
  }
  return sanitized;
};

/**
 * Middleware: NoSQL Query Injection Protection
 */
export const mongoSanitize = (req, _res, next) => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.query) req.query = sanitizeData(req.query);
  if (req.params) req.params = sanitizeData(req.params);
  next();
};

/**
 * Middleware: Strict Rate Limiter for Authentication (Brute Force Protection)
 * Max 10 attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

/**
 * Middleware: Rate Limiter for File Uploads
 * Max 30 file uploads per 15 minutes per IP
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many upload requests. Please wait a few minutes before uploading again.",
  },
});
