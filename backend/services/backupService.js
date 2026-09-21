import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupRoot = path.resolve(__dirname, "../backups");
const MAX_BACKUPS_TO_KEEP = 10;

/**
 * Ensures backup root directory exists
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(backupRoot)) {
    fs.mkdirSync(backupRoot, { recursive: true });
  }
};

/**
 * Get all available backup directory names sorted newest to oldest
 */
export const listBackups = () => {
  ensureBackupDir();
  return fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("backup_"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
};

/**
 * Remove old backups keeping only the most recent N snapshots
 */
const pruneOldBackups = () => {
  try {
    const backups = listBackups();
    if (backups.length > MAX_BACKUPS_TO_KEEP) {
      const toDelete = backups.slice(MAX_BACKUPS_TO_KEEP);
      for (const folderName of toDelete) {
        const fullPath = path.join(backupRoot, folderName);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`[AutoBackup] Pruned old backup: ${folderName}`);
      }
    }
  } catch (err) {
    console.warn("[AutoBackup] Warning: Failed to prune old backups:", err.message);
  }
};

/**
 * Performs a full MongoDB backup using mongodump
 */
export const performBackup = () => {
  return new Promise((resolve, reject) => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return reject(new Error("MONGODB_URI is not set"));
    }

    ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const targetDir = path.join(backupRoot, `backup_${timestamp}`);

    const dumpProcess = spawn("mongodump", [`--uri=${uri}`, `--out=${targetDir}`]);

    dumpProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`[AutoBackup] Backup created successfully: backup_${timestamp}`);
        pruneOldBackups();
        resolve(targetDir);
      } else {
        const err = new Error(`mongodump exited with code ${code}`);
        console.error(`[AutoBackup] Backup failed:`, err.message);
        reject(err);
      }
    });

    dumpProcess.on("error", (err) => {
      console.error("[AutoBackup] mongodump spawn error:", err.message);
      reject(err);
    });
  });
};

/**
 * Restores MongoDB database using mongorestore
 */
export const performRestore = (snapshotPath = null) => {
  return new Promise((resolve, reject) => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return reject(new Error("MONGODB_URI is not set"));
    }

    let restoreDir = snapshotPath;
    if (!restoreDir) {
      const backups = listBackups();
      if (backups.length === 0) {
        return reject(new Error("No backups found to restore from"));
      }
      restoreDir = path.join(backupRoot, backups[0]);
    }

    if (!fs.existsSync(restoreDir)) {
      return reject(new Error(`Backup directory not found: ${restoreDir}`));
    }

    // Check if there is a subfolder named after the database
    const subDirs = fs
      .readdirSync(restoreDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let targetDir = restoreDir;
    if (subDirs.length === 1 && !fs.readdirSync(restoreDir).some((f) => f.endsWith(".bson"))) {
      targetDir = path.join(restoreDir, subDirs[0]);
    }

    console.log(`[AutoRestore] Restoring database from: ${targetDir}`);

    const restoreProcess = spawn("mongorestore", [`--uri=${uri}`, "--drop", targetDir]);

    restoreProcess.on("close", (code) => {
      if (code === 0) {
        console.log("[AutoRestore] Database successfully restored!");
        resolve(targetDir);
      } else {
        const err = new Error(`mongorestore exited with code ${code}`);
        console.error("[AutoRestore] Restore failed:", err.message);
        reject(err);
      }
    });

    restoreProcess.on("error", (err) => {
      console.error("[AutoRestore] mongorestore spawn error:", err.message);
      reject(err);
    });
  });
};

/**
 * Checks if the database is empty or lost data, and auto-restores or auto-backs up
 */
export const autoRecoverAndBackup = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    // Check if collections exist and have data
    const collections = await db.listCollections().toArray();
    let totalDocs = 0;

    for (const col of collections) {
      if (!col.name.startsWith("system.")) {
        const count = await db.collection(col.name).estimatedDocumentCount();
        totalDocs += count;
      }
    }

    const availableBackups = listBackups();

    // 1. AUTO-RESTORE: If database is completely empty/lost but we have backup snapshots available
    if (totalDocs === 0 && availableBackups.length > 0) {
      console.log("⚠️ Database appears empty or lost. Initiating automatic recovery from latest backup...");
      await performRestore(path.join(backupRoot, availableBackups[0]));
      console.log("✅ Auto-recovery completed successfully!");
      return;
    }

    // 2. AUTO-BACKUP: If database has data, create an initial startup backup snapshot
    if (totalDocs > 0) {
      console.log(`[AutoBackup] Database active (${totalDocs} documents). Creating startup snapshot...`);
      await performBackup().catch((err) =>
        console.warn("[AutoBackup] Startup backup warning:", err.message),
      );
    }
  } catch (error) {
    console.error("[AutoRecovery] Error during auto check/recovery:", error.message);
  }
};

/**
 * Initializes auto backup scheduler (default: every 12 hours)
 */
export const startScheduledBackups = (intervalHours = 12) => {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  setInterval(async () => {
    console.log("[AutoBackup] Running scheduled automatic backup...");
    try {
      await performBackup();
    } catch (err) {
      console.error("[AutoBackup] Scheduled backup error:", err.message);
    }
  }, intervalMs).unref();
};
