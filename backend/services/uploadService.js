import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cloudinary, configured as cloudinaryConfigured } from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadFile = async (file, folder = "general") => {
  if (!file) throw new Error("No file provided");

  // Try Cloudinary first if configured
  if (cloudinaryConfigured) {
    try {
      const isDoc =
        file.mimetype.includes("pdf") ||
        file.mimetype.includes("msword") ||
        file.mimetype.includes("officedocument");
      
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `careerhub/${folder}`,
            resource_type: isDoc ? "raw" : "auto",
          },
          (error, res) => (error ? reject(error) : resolve(res)),
        );
        stream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to local disk:", cloudErr.message);
    }
  }

  // Local disk fallback
  const ext = path.extname(file.originalname) || ".bin";
  const uniqueName = `${folder}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(filePath, file.buffer);

  return {
    url: `/uploads/${uniqueName}`,
    name: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
};
