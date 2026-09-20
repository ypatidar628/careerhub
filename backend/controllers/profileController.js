import { updateProfile, publicUser } from "../models/userModel.js";
import { uploadFile } from "../services/uploadService.js";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const resumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
  if (
    !req.file ||
    !imageTypes.includes(req.file.mimetype) ||
    req.file.size > 5 * 1024 * 1024
  ) {
    return res
      .status(400)
      .json({ message: "Upload a JPG, PNG, WEBP, or GIF image under 5 MB." });
  }

  try {
    const result = await uploadFile(req.file, "avatars");
    const user = await updateProfile(req.user.id, {
      avatarUrl: result.url,
    });
    return res.json({ url: result.url, user: publicUser(user) });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res
      .status(500)
      .json({ message: "Avatar upload failed. Please try again." });
  }
};

export const resume = async (req, res) => {
  if (
    !req.file ||
    !resumeTypes.includes(req.file.mimetype) ||
    req.file.size > 10 * 1024 * 1024
  ) {
    return res
      .status(400)
      .json({ message: "Upload a PDF, DOC, or DOCX file under 10 MB." });
  }

  try {
    const result = await uploadFile(req.file, "resumes");
    await updateProfile(req.user.id, {
      resumeUrl: result.url,
      resumeName: req.file.originalname,
    });
    return res.json({ url: result.url, name: req.file.originalname });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res
      .status(500)
      .json({ message: "Resume upload failed. Please try again." });
  }
};
