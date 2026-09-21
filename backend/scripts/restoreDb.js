import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Error: MONGODB_URI is not defined in backend/.env");
  process.exit(1);
}

// Mask credentials for logging
const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");

const backupRoot = path.resolve(__dirname, "../backups");
let restorePath = process.argv[2];

if (!restorePath) {
  if (!fs.existsSync(backupRoot)) {
    console.error("❌ No backups folder found at:", backupRoot);
    process.exit(1);
  }

  const entries = fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("backup_"))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  if (entries.length === 0) {
    console.error("❌ No backup directories found in:", backupRoot);
    process.exit(1);
  }

  restorePath = path.join(backupRoot, entries[0]);
  console.log(`ℹ️ No backup path specified. Using latest backup: ${entries[0]}`);
} else {
  restorePath = path.resolve(process.cwd(), restorePath);
}

if (!fs.existsSync(restorePath)) {
  console.error("❌ Backup path does not exist:", restorePath);
  process.exit(1);
}

// If directory contains a database subfolder (e.g., careerhub), use that or root
const subDirs = fs
  .readdirSync(restorePath, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let targetRestoreDir = restorePath;
if (subDirs.length === 1 && !fs.readdirSync(restorePath).some((f) => f.endsWith(".bson"))) {
  targetRestoreDir = path.join(restorePath, subDirs[0]);
}

console.log("=========================================");
console.log(" 🔄 CareerHub Database Restore / Recovery");
console.log("=========================================");
console.log(`Target Database: ${maskedUri}`);
console.log(`Restoring From:  ${targetRestoreDir}\n`);

// Run mongorestore with --drop to cleanly restore collections & indexes
const restoreProcess = spawn("mongorestore", [`--uri=${uri}`, "--drop", targetRestoreDir], {
  stdio: "inherit",
});

restoreProcess.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Database restoration completed successfully!");
    console.log("=========================================");
  } else {
    console.error(`\n❌ Restore process exited with code ${code}`);
    process.exit(code || 1);
  }
});
