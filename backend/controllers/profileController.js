import { updateProfile, publicUser, findById } from "../models/userModel.js";
import { uploadFile } from "../services/uploadService.js";
import { Application } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";
import { SavedJob } from "../models/savedJobModel.js";
import mongoose from "mongoose";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const resumeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const update = async (req, res) => {
  const allowed = [
    "name",
    "phone",
    "location",
    "bio",
    "experience",
    "skills",
    "department",
    "enrollmentNumber",
    "education",
    "address",
    "city",
    "state",
    "country",
    "postalCode",
    "portfolioUrl",
    "githubUrl",
    "linkedinUrl",
  ];

  const profileData = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );

  const user = await updateProfile(req.user.id, profileData);

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
    const user = await updateProfile(req.user.id, {
      resumeUrl: result.url,
      resumeName: req.file.originalname,
    });
    return res.json({
      url: result.url,
      name: req.file.originalname,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return res
      .status(500)
      .json({ message: "Resume upload failed. Please try again." });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const user = await updateProfile(req.user.id, {
      resumeUrl: null,
      resumeName: null,
    });
    return res.json({
      message: "Resume removed successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Resume deletion error:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove resume. Please try again." });
  }
};
