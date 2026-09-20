import "./config/env.js";
import http from "http";
import app from "./config/app.js";
import { closeDB, connectDB } from "./config/db.js";
import { initSocket, closeSocket } from "./sockets/chatSocket.js";

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET must be set. Copy backend/.env.example to backend/.env and configure the required values.",
      );
    }

    await connectDB();

    const port = Number(process.env.PORT || 5000);
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    initSocket(httpServer);

    const server = httpServer.listen(port, () => {
      console.log(`CareerHub API & Socket.IO listening on http://localhost:${port}`);
    });

    let isShuttingDown = false;
    const shutdown = async (signal) => {
      if (isShuttingDown) {
        process.exit(0);
        return;
      }
      isShuttingDown = true;
      console.log(`\n${signal} received. Gracefully shutting down...`);

      // Safety timeout: force exit if closing connections takes longer than 1s
      const forceTimer = setTimeout(() => {
        process.exit(0);
      }, 1000);
      forceTimer.unref();

      try {
        closeSocket();
        if (typeof server.closeAllConnections === "function") {
          server.closeAllConnections();
        }
        server.close(async () => {
          try {
            await closeDB();
          } catch {}
          process.exit(0);
        });
      } catch (err) {
        process.exit(0);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start the backend:", error.message);
    process.exit(1);
  }
};

startServer();
