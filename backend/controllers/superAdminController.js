import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, ROLES, normalizeRole, publicUser, createUser as createModelUser } from "../models/userModel.js";
import { Job } from "../models/jobModel.js";
import { Application, stages } from "../models/applicationModel.js";
import { Activity, logActivity, listRecentActivities } from "../models/activityModel.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 1. Super Admin & Admin Dashboard Overview Statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalSuperAdmins,
        activeUsers,
        inactiveUsers,
        totalJobs,
        totalApplications,
        pendingApplications,
        interviewApplications,
        selectedApplications,
        rejectedApplications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: ROLES.CANDIDATE }),
        User.countDocuments({ role: ROLES.RECRUITER }),
        User.countDocuments({ role: ROLES.ADMIN }),
        User.countDocuments({ role: ROLES.SUPER_ADMIN }),
        User.countDocuments({ isActive: { $ne: false } }),
        User.countDocuments({ isActive: false }),
        Job.countDocuments(),
        Application.countDocuments(),
        Application.countDocuments({ status: { $in: ["Applied", "Under Review"] } }),
        Application.countDocuments({ status: "Interview" }),
        Application.countDocuments({ status: "Selected" }),
        Application.countDocuments({ status: "Rejected" }),
      ]);

      const recentActivities = await listRecentActivities(12);

      const applicationsByStatus = [
        { name: "Pending / Review", value: pendingApplications },
        { name: "Shortlisted", value: await Application.countDocuments({ status: "Shortlisted" }) },
        { name: "Interview", value: interviewApplications },
        { name: "Selected", value: selectedApplications },
        { name: "Rejected", value: rejectedApplications },
      ];

      const usersByRole = [
        { name: "Candidates", value: totalCandidates, color: "#38bdf8" },
        { name: "Recruiters", value: totalRecruiters, color: "#818cf8" },
        { name: "Admins", value: totalAdmins, color: "#a855f7" },
        { name: "Super Admin", value: totalSuperAdmins, color: "#f59e0b" },
      ];

      const jobsByMode = [
        { name: "Remote", value: await Job.countDocuments({ mode: "Remote" }) },
        { name: "Hybrid", value: await Job.countDocuments({ mode: "Hybrid" }) },
        { name: "On-site", value: await Job.countDocuments({ mode: "On-site" }) },
      ];

      return res.json({
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalSuperAdmins,
        activeUsers,
        inactiveUsers,
        totalJobs,
        totalApplications,
        pendingApplications,
        interviewApplications,
        selectedApplications,
        rejectedApplications,
        usersByRole,
        applicationsByStatus,
        jobsByMode,
        recentActivities,
      });
    }

    // In-memory fallback stats
    return res.json({
      totalUsers: 4,
      totalCandidates: 1,
      totalRecruiters: 1,
      totalAdmins: 1,
      totalSuperAdmins: 1,
      activeUsers: 4,
      inactiveUsers: 0,
      totalJobs: 2,
      totalApplications: 2,
      pendingApplications: 1,
      interviewApplications: 1,
      selectedApplications: 0,
      rejectedApplications: 0,
      usersByRole: [
        { name: "Candidates", value: 1, color: "#38bdf8" },
        { name: "Recruiters", value: 1, color: "#818cf8" },
        { name: "Admins", value: 1, color: "#a855f7" },
        { name: "Super Admin", value: 1, color: "#f59e0b" },
      ],
      applicationsByStatus: [
        { name: "Pending / Review", value: 1 },
        { name: "Shortlisted", value: 0 },
        { name: "Interview", value: 1 },
      ],
      jobsByMode: [
        { name: "Remote", value: 1 },
        { name: "Hybrid", value: 1 },
        { name: "On-site", value: 0 },
      ],
      recentActivities: await listRecentActivities(10),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard metrics.", error: error.message });
  }
};

/**
 * 2. User Management: List, Search, Filter
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search = "", role = "ALL", status = "ALL", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (role && role !== "ALL") {
        query.role = normalizeRole(role);
      }

      if (status === "ACTIVE") {
        query.isActive = { $ne: false };
      } else if (status === "INACTIVE") {
        query.isActive = false;
      }

      if (search && search.trim()) {
        const keyword = search.trim();
        const regex = new RegExp(keyword, "i");
        query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
      }

      const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ]);

      return res.json({
        users: users.map((u) => publicUser(u)),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      });
    }

    return res.json({
      users: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      totalPages: 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve users.", error: error.message });
  }
};

/**
 * 3. View Complete User Profile & Related Records
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let extraData = {};
    if (user.role === ROLES.CANDIDATE) {
      const applications = await Application.find({ candidateId: id })
        .populate("jobId", "title company location")
        .sort({ createdAt: -1 })
        .lean();
      extraData = {
        applicationsCount: applications.length,
        applications: applications.map((a) => ({
          id: String(a._id),
          jobTitle: a.jobTitle,
          company: a.company,
          status: a.status,
          appliedAt: a.createdAt,
        })),
      };
    } else if (user.role === ROLES.RECRUITER) {
      const jobs = await Job.find({ recruiterId: id }).sort({ createdAt: -1 }).lean();
      const jobIds = jobs.map((j) => j._id);
      const applicationsReceived = await Application.countDocuments({ jobId: { $in: jobIds } });
      extraData = {
        postedJobsCount: jobs.length,
        applicationsReceived,
        jobs: jobs.map((j) => ({
          id: String(j._id),
          title: j.title,
          company: j.company,
          status: j.status,
          postedAt: j.createdAt,
        })),
      };
    }

    return res.json({
      user: publicUser(user),
      ...extraData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user profile.", error: error.message });
  }
};

/**
 * 4. Create User (Candidate, Recruiter, or Admin by Super Admin)
 * CRITICAL RULE: System allows only ONE Super Admin. Creating another Super Admin is strictly blocked.
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, permissions, department, education, location, bio } = req.body;
    const actorRole = normalizeRole(req.user.role);

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "A valid name is required." });
    }

    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const targetRole = normalizeRole(role || ROLES.CANDIDATE);

    // Rule 1: NEVER allow creating a Super Admin
    if (targetRole === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Security Violation: CareerHub supports exactly ONE Super Admin. You cannot create another Super Admin.",
      });
    }

    // Rule 2: Only Super Admin can create Admin accounts
    if (targetRole === ROLES.ADMIN && actorRole !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Restricted: Only the Super Admin is authorized to create Admin accounts.",
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email address already exists." });
    }

    const sanitizedPhone = phone ? String(phone).replace(/\D/g, "").slice(0, 10) : "";

    const user = await createModelUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: targetRole,
      phone: sanitizedPhone,
      permissions: targetRole === ROLES.ADMIN ? permissions : undefined,
    });

    if (location || bio || department || education) {
      await User.findByIdAndUpdate(user.id, {
        $set: {
          "profile.location": location || "",
          "profile.bio": bio || "",
          "profile.department": department || "",
          "profile.education": education || "",
        },
      });
    }

    await logActivity({
      action: `${targetRole} Account Created`,
      details: `${req.user.name} created ${targetRole} account for ${name.trim()} (${email})`,
      category: targetRole === ROLES.ADMIN ? "ADMIN" : "USER",
      performedBy: req.user,
      targetUser: user,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: `${targetRole} user created successfully.`,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user.", error: error.message });
  }
};

/**
 * 5. Update User Details
 * CRITICAL RULE: Protect the Super Admin account from role modification or unauthorized changes
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const actorRole = normalizeRole(req.user.role);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetRole = normalizeRole(targetUser.role);

    // Rule: Admins cannot modify Super Admin or other Admins
    if (actorRole === ROLES.ADMIN) {
      if (targetRole === ROLES.SUPER_ADMIN || targetRole === ROLES.ADMIN) {
        return res.status(403).json({
          message: "Restricted: Admins cannot modify Super Admin or other Admin accounts.",
        });
      }
    }

    const { name, email, phone, role, permissions, isActive, profile } = req.body;

    // Rule: Super Admin role CANNOT be changed
    if (targetRole === ROLES.SUPER_ADMIN && role && normalizeRole(role) !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Security Violation: The Super Admin's role cannot be downgraded or altered.",
      });
    }

    // Rule: Non-super-admins cannot elevate users to Admin or Super Admin
    if (role && actorRole !== ROLES.SUPER_ADMIN) {
      const requestedNewRole = normalizeRole(role);
      if (requestedNewRole === ROLES.ADMIN || requestedNewRole === ROLES.SUPER_ADMIN) {
        return res.status(403).json({
          message: "Restricted: Only the Super Admin can promote accounts to Admin or Super Admin.",
        });
      }
    }

    // Rule: Cannot create second Super Admin via role update
    if (role && normalizeRole(role) === ROLES.SUPER_ADMIN && targetRole !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Security Violation: Only ONE Super Admin is permitted in CareerHub.",
      });
    }

    if (name && typeof name === "string") targetUser.name = name.trim();
    if (email && EMAIL_REGEX.test(email)) {
      const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: targetUser._id } });
      if (duplicate) {
        return res.status(409).json({ message: "Another user already uses that email address." });
      }
      targetUser.email = email.toLowerCase();
    }
    if (phone !== undefined) {
      targetUser.phone = String(phone).replace(/\D/g, "").slice(0, 10);
    }
    if (role && targetRole !== ROLES.SUPER_ADMIN) {
      targetUser.role = normalizeRole(role);
    }
    if (permissions && targetUser.role === ROLES.ADMIN && actorRole === ROLES.SUPER_ADMIN) {
      targetUser.permissions = permissions;
    }
    if (isActive !== undefined && targetRole !== ROLES.SUPER_ADMIN) {
      targetUser.isActive = Boolean(isActive);
    }
    if (profile && typeof profile === "object") {
      targetUser.profile = { ...(targetUser.profile || {}), ...profile };
    }

    await targetUser.save();

    await logActivity({
      action: "User Updated",
      details: `${req.user.name} updated account details for ${targetUser.name}`,
      category: targetRole === ROLES.ADMIN ? "ADMIN" : "USER",
      performedBy: req.user,
      targetUser,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: "User updated successfully.",
      user: publicUser(targetUser),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user.", error: error.message });
  }
};

/**
 * 6. Toggle Active / Inactive Status
 * CRITICAL RULE: Super Admin account CANNOT be deactivated.
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const actorRole = normalizeRole(req.user.role);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetRole = normalizeRole(targetUser.role);

    // Rule: Super Admin CANNOT be deactivated under any circumstance
    if (targetRole === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Security Violation: The Super Admin account cannot be deactivated.",
      });
    }

    // Rule: Admins cannot toggle status of other Admins or Super Admin
    if (actorRole === ROLES.ADMIN && targetRole === ROLES.ADMIN) {
      return res.status(403).json({
        message: "Restricted: Only the Super Admin can deactivate Admin accounts.",
      });
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    const statusWord = targetUser.isActive ? "Activated" : "Deactivated";

    await logActivity({
      action: `User ${statusWord}`,
      details: `${req.user.name} ${statusWord.toLowerCase()} ${targetUser.name} (${targetUser.email})`,
      category: targetRole === ROLES.ADMIN ? "ADMIN" : "SECURITY",
      performedBy: req.user,
      targetUser,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `User ${statusWord.toLowerCase()} successfully.`,
      isActive: targetUser.isActive,
      user: publicUser(targetUser),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle user status.", error: error.message });
  }
};

/**
 * 7. Delete User
 * CRITICAL RULE: Super Admin account CANNOT be deleted.
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const actorRole = normalizeRole(req.user.role);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetRole = normalizeRole(targetUser.role);

    // Rule 1: Super Admin CANNOT be deleted
    if (targetRole === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Security Violation: The Super Admin account cannot be deleted.",
      });
    }

    // Rule 2: Admins cannot delete other Admins or Super Admin
    if (actorRole === ROLES.ADMIN && targetRole === ROLES.ADMIN) {
      return res.status(403).json({
        message: "Restricted: Only the Super Admin can delete Admin accounts.",
      });
    }

    // Cascade cleanups if candidate or recruiter
    if (targetRole === ROLES.RECRUITER) {
      await Job.deleteMany({ recruiterId: id });
      await Application.deleteMany({ recruiterId: id });
    } else if (targetRole === ROLES.CANDIDATE) {
      await Application.deleteMany({ candidateId: id });
    }

    await User.findByIdAndDelete(id);

    await logActivity({
      action: "User Deleted",
      details: `${req.user.name} permanently deleted ${targetRole} ${targetUser.name} (${targetUser.email})`,
      category: targetRole === ROLES.ADMIN ? "ADMIN" : "USER",
      performedBy: req.user,
      targetUser,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `User ${targetUser.name} has been permanently deleted.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user.", error: error.message });
  }
};

/**
 * 8. ADMIN MANAGEMENT (SUPER ADMIN ONLY)
 */
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: ROLES.ADMIN }).sort({ createdAt: -1 }).lean();
    return res.json({
      admins: admins.map((a) => publicUser(a)),
      total: admins.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admins.", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password (min 8 chars) are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const admin = await createModelUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: ROLES.ADMIN,
      permissions: permissions.length
        ? permissions
        : ["manage_candidates", "manage_recruiters", "manage_jobs", "manage_applications"],
    });

    await logActivity({
      action: "Admin Account Created",
      details: `Super Admin created new Admin: ${name} (${email})`,
      category: "ADMIN",
      performedBy: req.user,
      targetUser: admin,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: `Admin ${name} created successfully.`,
      admin,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create Admin.", error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, permissions, isActive } = req.body;

    const admin = await User.findOne({ _id: id, role: ROLES.ADMIN });
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    if (name) admin.name = name.trim();
    if (email && EMAIL_REGEX.test(email)) {
      const duplicate = await User.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } });
      if (duplicate) {
        return res.status(409).json({ message: "Another user already uses that email." });
      }
      admin.email = email.toLowerCase();
    }
    if (permissions && Array.isArray(permissions)) {
      admin.permissions = permissions;
    }
    if (isActive !== undefined) {
      admin.isActive = Boolean(isActive);
    }

    await admin.save();

    await logActivity({
      action: "Admin Account Updated",
      details: `Super Admin updated permissions/details for Admin: ${admin.name}`,
      category: "ADMIN",
      performedBy: req.user,
      targetUser: admin,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: "Admin account updated successfully.",
      admin: publicUser(admin),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update Admin.", error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOne({ _id: id, role: ROLES.ADMIN });
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    await User.findByIdAndDelete(id);

    await logActivity({
      action: "Admin Account Deleted",
      details: `Super Admin deleted Admin account: ${admin.name} (${admin.email})`,
      category: "ADMIN",
      performedBy: req.user,
      targetUser: admin,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Admin ${admin.name} deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete Admin.", error: error.message });
  }
};

/**
 * 9. CANDIDATE MANAGEMENT (SUPER ADMIN & AUTHORIZED ADMINS)
 */
export const getCandidates = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { role: ROLES.CANDIDATE };
    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(keyword, "i");
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [total, candidates] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);

    // Attach application counts for each candidate
    const candidateIds = candidates.map((c) => c._id);
    const appCounts = await Application.aggregate([
      { $match: { candidateId: { $in: candidateIds } } },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
    ]);
    const appMap = new Map(appCounts.map((item) => [String(item._id), item.count]));

    const enriched = candidates.map((c) => ({
      ...publicUser(c),
      applicationsCount: appMap.get(String(c._id)) || 0,
    }));

    return res.json({
      candidates: enriched,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve candidates.", error: error.message });
  }
};

/**
 * 10. RECRUITER MANAGEMENT (SUPER ADMIN & AUTHORIZED ADMINS)
 */
export const getRecruiters = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { role: ROLES.RECRUITER };
    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(keyword, "i");
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [total, recruiters] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);

    // Attach posted jobs count and company details
    const recruiterIds = recruiters.map((r) => r._id);
    const jobCounts = await Job.aggregate([
      { $match: { recruiterId: { $in: recruiterIds } } },
      { $group: { _id: "$recruiterId", count: { $sum: 1 } } },
    ]);
    const jobMap = new Map(jobCounts.map((item) => [String(item._id), item.count]));

    const enriched = recruiters.map((r) => ({
      ...publicUser(r),
      jobsCount: jobMap.get(String(r._id)) || 0,
      company: r.profile?.department || r.name,
    }));

    return res.json({
      recruiters: enriched,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve recruiters.", error: error.message });
  }
};

/**
 * 11. PLATFORM JOBS MANAGEMENT (SUPER ADMIN & AUTHORIZED ADMINS)
 */
export const getAllJobs = async (req, res) => {
  try {
    const { search = "", status = "ALL", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== "ALL") query.status = status;
    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(keyword, "i");
      query.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate("recruiterId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);
    const appMap = new Map(appCounts.map((item) => [String(item._id), item.count]));

    const enriched = jobs.map((j) => ({
      ...j,
      id: String(j._id),
      applicantsCount: appMap.get(String(j._id)) || 0,
    }));

    return res.json({
      jobs: enriched,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve jobs.", error: error.message });
  }
};

export const deleteJobByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    await Application.deleteMany({ jobId: id });
    await Job.findByIdAndDelete(id);

    await logActivity({
      action: "Job Deleted by Admin",
      details: `${req.user.name} removed job posting: "${job.title}" (${job.company})`,
      category: "JOB",
      performedBy: req.user,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: `Job "${job.title}" removed successfully.` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete job.", error: error.message });
  }
};

/**
 * 12. PLATFORM APPLICATIONS MANAGEMENT (SUPER ADMIN & AUTHORIZED ADMINS)
 */
export const getAllApplications = async (req, res) => {
  try {
    const { search = "", status = "ALL", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== "ALL") query.status = status;
    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(keyword, "i");
      query.$or = [
        { candidateName: regex },
        { candidateEmail: regex },
        { jobTitle: regex },
        { company: regex },
      ];
    }

    const [total, applications] = await Promise.all([
      Application.countDocuments(query),
      Application.find(query)
        .populate("jobId", "title company location mode salary")
        .populate("candidateId", "name email phone profileImage")
        .populate("recruiterId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return res.json({
      applications: applications.map((a) => ({
        ...a,
        id: String(a._id),
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      availableStages: stages,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve applications.", error: error.message });
  }
};

export const updateApplicationStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!stages.includes(status)) {
      return res.status(400).json({
        message: `Invalid stage. Must be one of: ${stages.join(", ")}`,
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedByName: req.user.name,
      changedByRole: normalizeRole(req.user.role),
      note: note || `Admin updated stage to ${status}`,
      changedAt: new Date(),
    });
    await application.save();

    await logActivity({
      action: "Application Stage Updated",
      details: `${req.user.name} changed status of application #${id} to ${status}`,
      category: "APPLICATION",
      performedBy: req.user,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Application stage changed to ${status}.`,
      application: { ...application.toObject(), id: String(application._id) },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update application.", error: error.message });
  }
};

/**
 * 13. System Activity & Important Actions Log
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await listRecentActivities(parseInt(limit, 10) || 50);
    return res.json({ activities: logs, total: logs.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch activities.", error: error.message });
  }
};
