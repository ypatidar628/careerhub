import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findByEmail,
  findById,
  publicUser,
} from "../models/userModel.js";

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
  const { name, email, password, role = "candidate" } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    password.length < 8 ||
    !["candidate", "recruiter", "admin"].includes(role)
  ) {
    return res
      .status(400)
      .json({ message: "Please provide valid registration details." });
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "An account with that email already exists." });
  }

  const user = await createUser({ name, email, password, role });
  return issue(res.status(201), user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

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
