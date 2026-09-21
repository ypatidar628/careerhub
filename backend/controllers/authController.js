import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findByEmail,
  findById,
  publicUser,
} from "../models/userModel.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const issue = (res, user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ user: publicUser(user), token });
};

export const register = async (req, res) => {
  const { name, password, role = "candidate" } = req.body;
  const rawEmail = req.body.email;

  if (!rawEmail || typeof rawEmail !== "string") {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  const email = rawEmail.trim().toLowerCase();

  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    !EMAIL_REGEX.test(email) ||
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    !["candidate", "recruiter"].includes(role) // Prevent unauthorized admin role registration
  ) {
    return res.status(400).json({
      message:
        "Please provide a valid name, email, password (min 8 chars), and role ('candidate' or 'recruiter').",
    });
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "An account with that email already exists." });
  }

  const user = await createUser({ name: name.trim(), email, password, role });
  return issue(res.status(201), user);
};

export const login = async (req, res) => {
  const { password } = req.body;
  const rawEmail = req.body.email;

  if (!rawEmail || !password || typeof rawEmail !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const email = rawEmail.trim().toLowerCase();
  const user = await findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password || ""))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  return issue(res, user);
};

export const logout = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ success: true, message: "Logged out successfully." });
};

export const me = async (req, res) => {
  const user = await findById(req.user.id);
  return res.json({ user: publicUser(user) });
};

export const refresh = async (req, res) => {
  const user = await findById(req.user.id);
  return issue(res, user);
};
