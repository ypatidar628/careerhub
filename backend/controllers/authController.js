import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findByEmail,
  findById,
  publicUser,
  ROLES,
  normalizeRole,
  updatePassword,
} from "../models/userModel.js";
import { generateAndSendOtp, verifyOtp } from "../services/otpService.js";
import { logActivity } from "../models/activityModel.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const issue = (res, user) => {
  const normRole = normalizeRole(user.role);
  const token = jwt.sign(
    { id: user.id, role: normRole },
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

/**
 * Dispatch or Resend OTP code using Nodemailer
 * Valid for 30 seconds
 */
export const requestOtp = async (req, res) => {
  const rawEmail = req.body.email;
  const purpose = req.body.purpose || "registration";

  if (!rawEmail || typeof rawEmail !== "string" || !EMAIL_REGEX.test(rawEmail.trim())) {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  const email = rawEmail.trim().toLowerCase();

  // If registering, check if email is already taken
  if (purpose === "registration") {
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }
  }

  // If resetting password, verify account exists
  if (purpose === "reset") {
    const existing = await findByEmail(email);
    if (!existing) {
      return res.status(404).json({ message: "No account found with this email address." });
    }
  }

  try {
    const result = await generateAndSendOtp(email, purpose);
    return res.json({
      success: true,
      message: "Verification code sent to your email. Valid for 10 minutes.",
      expiresInSeconds: 600,
      code: result.code, // Included for dev testing
      previewUrl: result.previewUrl,
      mailSent: result.mailSent,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send verification code. Please try again.",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  const { name, password, role = ROLES.CANDIDATE, otp, phone } = req.body;
  const rawEmail = req.body.email;

  if (!rawEmail || typeof rawEmail !== "string") {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  const email = rawEmail.trim().toLowerCase();
  const requestedRole = String(role).trim().toUpperCase();

  // Security: Public self-registration ONLY allows CANDIDATE or RECRUITER
  // Elevating to ADMIN or SUPER_ADMIN via public registration is strictly blocked
  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    !EMAIL_REGEX.test(email) ||
    !password ||
    typeof password !== "string" ||
    password.length < 8 ||
    ![ROLES.CANDIDATE, ROLES.RECRUITER, "CANDIDATE", "RECRUITER", "candidate", "recruiter"].includes(role)
  ) {
    return res.status(400).json({
      message:
        "Please provide a valid name, email, password (min 8 chars), and role ('CANDIDATE' or 'RECRUITER').",
    });
  }

  // Validate phone if provided: max 10 digits, numeric only
  let sanitizedPhone = "";
  if (phone !== undefined && phone !== null && phone !== "") {
    const phoneStr = String(phone).trim();
    if (!/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits with no characters.",
      });
    }
    sanitizedPhone = phoneStr;
  }

  // If OTP is provided, verify it against the 30s expiration store
  if (otp) {
    const otpValidation = verifyOtp(email, String(otp).trim());
    if (!otpValidation.valid) {
      return res.status(400).json({ message: otpValidation.reason });
    }
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "An account with that email already exists." });
  }

  const finalRole = requestedRole === "RECRUITER" ? ROLES.RECRUITER : ROLES.CANDIDATE;

  const user = await createUser({
    name: name.trim(),
    email,
    password,
    role: finalRole,
    phone: sanitizedPhone,
  });

  await logActivity({
    action: "User Registered",
    details: `${name.trim()} signed up as ${finalRole}`,
    category: "USER",
    performedBy: user,
    targetUser: user,
    ipAddress: req.ip,
  });

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

  // Check if deactivated (Super Admin cannot be deactivated)
  if (user.isActive === false && normalizeRole(user.role) !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      message: "Your account has been deactivated by an administrator. Please contact support.",
      accountDeactivated: true,
    });
  }

  await logActivity({
    action: "User Signed In",
    details: `${user.name} logged into ${normalizeRole(user.role)} workspace`,
    category: "SECURITY",
    performedBy: user,
    ipAddress: req.ip,
  });

  return issue(res, user);
};

export const logout = (req, res) => {
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

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findByEmail(normalizedEmail);
  if (!user) {
    return res.status(404).json({ message: "No account found with this email address." });
  }

  if (otp) {
    const otpValidation = verifyOtp(normalizedEmail, String(otp).trim(), "reset");
    if (!otpValidation.valid) {
      return res.status(400).json({ message: otpValidation.reason });
    }
  } else {
    return res.status(400).json({ message: "Verification code is required to reset password." });
  }

  await updatePassword(user.id, password);

  await logActivity({
    action: "Password Reset",
    details: `${user.name} successfully reset their account password`,
    category: "SECURITY",
    performedBy: user,
    targetUser: user,
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    message: "Password reset successful! You can now sign in with your new password.",
  });
};
