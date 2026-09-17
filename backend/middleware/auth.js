import jwt from "jsonwebtoken";
import { findById, publicUser } from "../models/userModel.js";

export const requireAuth = async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(payload.id);
    if (!user) throw new Error("User not found.");
    req.user = publicUser(user);
    return next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }
};

export const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return res
      .status(403)
      .json({ message: "You do not have access to this resource." });
  };
