import "./config/env.js";
import app from "./config/app.js";
import { closeDB, connectDB } from "./config/db.js";

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET must be set. Copy backend/.env.example to backend/.env and configure the required values.",
      );
    }

    await connectDB();

    const port = Number(process.env.PORT || 5000);
    const server = app.listen(port, () => {
      console.log(`CareerHub API listening on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
      console.log(`
${signal} received. Gracefully shutting down...`);
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start the backend:", error.message);
    process.exit(1);
  }
};

startServer();
