import "../config/env.js";
import mongoose from "mongoose";
import { Job } from "../models/jobModel.js";

async function cleanJobs() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is not set in backend/.env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);

    const result = await Job.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} jobs from the database.`);

    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to clean jobs:", err.message);
    process.exit(1);
  }
}

cleanJobs();
