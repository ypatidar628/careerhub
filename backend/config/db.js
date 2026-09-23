import mongoose from "mongoose";
import { seedDemoUsers } from "../models/userModel.js";
import {
  autoRecoverAndBackup,
  startScheduledBackups,
} from "../services/backupService.js";

const logConnectionState = (state) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  console.log(`MongoDB state: ${states[state] || "unknown"}`);
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Copy backend/.env.example to backend/.env and add your connection string.",
    );
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    logConnectionState(mongoose.connection.readyState);
    console.log("MongoDB connected successfully.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    logConnectionState(mongoose.connection.readyState);
    console.log("MongoDB disconnected.");
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });

  // Check if database was empty/lost and auto-restore from backup if available,
  // or take an automated snapshot on server launch
  await autoRecoverAndBackup();

  await seedDemoUsers();

  // Start background auto-backup routine (runs every 12 hours)
  startScheduledBackups(Number(process.env.AUTO_BACKUP_INTERVAL_HOURS) || 12);
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
