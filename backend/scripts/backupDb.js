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

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.resolve(__dirname, "../backups");
const targetDir = path.join(backupRoot, `backup_${timestamp}`);

if (!fs.existsSync(backupRoot)) {
  fs.mkdirSync(backupRoot, { recursive: true });
}

console.log("=========================================");
console.log(" 📦 CareerHub Database Backup");
console.log("=========================================");
console.log(`Connecting to: ${maskedUri}`);
console.log(`Saving backup to: ${targetDir}\n`);

const dumpProcess = spawn("mongodump", [`--uri=${uri}`, `--out=${targetDir}`], {
  stdio: "inherit",
});

dumpProcess.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Database backup completed successfully!");
    console.log(`📁 Backup location: ${targetDir}`);
    console.log("=========================================");
  } else {
    console.error(`\n❌ Backup process exited with code ${code}`);
    process.exit(code || 1);
  }
});
