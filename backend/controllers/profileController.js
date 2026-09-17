import { configured, cloudinary } from "../config/cloudinary.js";
import { updateProfile, publicUser } from "../models/userModel.js";

const missing = (res) =>
  res.status(503).json({
    message:
      "File uploads are unavailable: Cloudinary is not configured on this server.",
  });

const send = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: folder.includes("resumes") ? "raw" : "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

export const update = async (req, res) => {
  const allowed = ["phone", "location", "bio", "experience", "skills"];
  const profile = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );
  const user = await updateProfile(req.user.id, profile);

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  return res.json({
    user: publicUser(user),
    message: "Profile updated successfully.",
  });
};

export const avatar = async (req, res) => {
  if (!configured) return missing(res);
  if (
    !req.file ||
    !["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype) ||
    req.file.size > 5 * 1024 * 1024
  ) {
    return res
      .status(400)
      .json({ message: "Upload a JPG, PNG, or WEBP image under 5 MB." });
  }

  try {
    const result = await send(req.file, "careerhub/avatars");
    const user = await updateProfile(req.user.id, {
      avatarUrl: result.secure_url,
    });
    return res.json({ url: result.secure_url, user: publicUser(user) });
  } catch {
    return res
      .status(502)
      .json({ message: "Avatar upload failed. Please try again." });
  }
};

export const resume = async (req, res) => {
  if (!configured) return missing(res);
  if (
    !req.file ||
    ![
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(req.file.mimetype)
  ) {
    return res
      .status(400)
      .json({ message: "Upload a PDF, DOC, or DOCX file under 10 MB." });
  }

  try {
    const result = await send(req.file, "careerhub/resumes");
    await updateProfile(req.user.id, {
      resumeUrl: result.secure_url,
      resumeName: req.file.originalname,
    });
    return res.json({ url: result.secure_url, name: req.file.originalname });
  } catch {
    return res
      .status(502)
      .json({ message: "Resume upload failed. Please try again." });
  }
};
