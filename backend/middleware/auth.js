import jwt from "jsonwebtoken";
import { findById, publicUser, ROLES } from "../models/userModel.js";

export const requireAuth = async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(payload.id);
    if (!user) throw new Error("User not found.");

    // Check account active status
    if (user.isActive === false && user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message:
          "Your account has been deactivated by an administrator. Please contact support.",
        accountDeactivated: true,
      });
    }

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
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const userRole = String(req.user.role).toUpperCase();
    const normalizedRoles = roles.map((r) => String(r).toUpperCase());

    // Super Admin has access to any Admin route
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (normalizedRoles.includes(userRole)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "You do not have permission to access this resource." });
  };

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const userRole = String(req.user.role).toUpperCase();
  if (userRole === ROLES.SUPER_ADMIN) {
    return next();
  }

  return res.status(403).json({
    message: "Restricted: This action requires Super Admin authority.",
  });
};

export const requireAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const userRole = String(req.user.role).toUpperCase();
  if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
    return next();
  }

  return res.status(403).json({
    message: "Restricted: Administrative privileges are required.",
  });
};
