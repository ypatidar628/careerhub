import mongoose from "mongoose";
import { seedDemoJobs } from "../models/jobModel.js";
import { seedDemoUsers } from "../models/userModel.js";

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

  await seedDemoUsers();
  await seedDemoJobs();
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
