import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CANDIDATE: "CANDIDATE",
};

export const normalizeRole = (role) => {
  if (!role) return ROLES.CANDIDATE;
  const r = String(role).trim().toUpperCase();
  if (r === "SUPER_ADMIN" || r === "SUPERADMIN" || r === "SUPER ADMIN") return ROLES.SUPER_ADMIN;
  if (r === "ADMIN") return ROLES.ADMIN;
  if (r === "RECRUITER") return ROLES.RECRUITER;
  if (r === "CANDIDATE") return ROLES.CANDIDATE;
  return r;
};

const fallbackUsers = [];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "RECRUITER", "CANDIDATE"],
      default: "CANDIDATE",
      set: (r) => normalizeRole(r),
      required: true,
    },
    permissions: {
      type: [String],
      default: [
        "manage_candidates",
        "manage_recruiters",
        "manage_jobs",
        "manage_applications",
      ],
    },
    phone: String,
    profileImage: String,
    skills: [String],
    bio: String,
    resume: {
      url: String,
      fileName: String,
    },
    isActive: { type: Boolean, default: true },
    lastSeen: Date,
    profile: {
      phone: String,
      location: String,
      bio: String,
      skills: [String],
      experience: String,
      education: String,
      department: String,
      enrollmentNumber: String,
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      avatarUrl: String,
      resumeUrl: String,
      resumeName: String,
      portfolioUrl: String,
      githubUrl: String,
      linkedinUrl: String,
      rating: { type: Number, default: 4.8 },
      reviewsCount: { type: Number, default: 12 },
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Single Super Admin and Security Pre-save Validation Hook
userSchema.pre("save", async function () {
  // Normalize role
  if (this.role) {
    this.role = normalizeRole(this.role);
  }

  // 1. Password Hashing
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // 2. Single Super Admin Constraint: Only ONE Super Admin allowed in the entire system
  if (this.isModified("role") && this.role === ROLES.SUPER_ADMIN) {
    const existingSuperAdmin = await mongoose.models.User.findOne({
      role: ROLES.SUPER_ADMIN,
      _id: { $ne: this._id },
    });
    if (existingSuperAdmin) {
      const err = new Error(
        "Security Violation: Exactly ONE Super Admin is permitted in CareerHub. Cannot create another Super Admin.",
      );
      err.status = 403;
      throw err;
    }
  }

  // 3. Super Admin Immutability Protection: Cannot change Super Admin's role or deactivate Super Admin
  if (!this.isNew) {
    const original = await mongoose.models.User.findById(this._id).select("role isActive");
    if (original && original.role === ROLES.SUPER_ADMIN) {
      if (this.isModified("role") && this.role !== ROLES.SUPER_ADMIN) {
        const err = new Error("Security Violation: The Super Admin role cannot be modified or downgraded.");
        err.status = 403;
        throw err;
      }
      if (this.isModified("isActive") && this.isActive === false) {
        const err = new Error("Security Violation: The Super Admin account cannot be deactivated.");
        err.status = 403;
        throw err;
      }
    }
  }
});

// Prevent Deleting Super Admin Hooks
userSchema.pre("deleteOne", { document: true, query: true }, async function () {
  if (this.role === ROLES.SUPER_ADMIN) {
    throw new Error("Security Violation: The Super Admin account cannot be deleted.");
  }
  if (typeof this.getFilter === "function") {
    const filter = this.getFilter();
    const user = await this.model.findOne(filter);
    if (user && user.role === ROLES.SUPER_ADMIN) {
      throw new Error("Security Violation: The Super Admin account cannot be deleted.");
    }
  }
});

userSchema.pre("findOneAndDelete", async function () {
  const filter = this.getFilter();
  const user = await this.model.findOne(filter);
  if (user && user.role === ROLES.SUPER_ADMIN) {
    throw new Error("Security Violation: The Super Admin account cannot be deleted.");
  }
});

userSchema.pre("deleteMany", async function () {
  const filter = this.getFilter();
  const users = await this.model.find(filter).select("role");
  if (users.some((u) => u.role === ROLES.SUPER_ADMIN)) {
    throw new Error("Security Violation: The Super Admin account cannot be deleted.");
  }
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);

export const publicUser = (user) => {
  if (!user) return null;

  const plain = user.toObject ? user.toObject() : { ...user };
  if (plain._id && !plain.id) {
    plain.id = String(plain._id);
  }
  delete plain.password;
  delete plain._id;

  // Ensure role is normalized string
  if (plain.role) {
    plain.role = normalizeRole(plain.role);
  }

  if (plain.isActive === undefined) {
    plain.isActive = true;
  }

  return plain;
};

const seedFallbackUsers = async () => {
  if (fallbackUsers.length) return fallbackUsers;

  const password = await bcrypt.hash("password123", 10);
  fallbackUsers.push(
    {
      id: "u0",
      name: "Super Admin",
      email: "superadmin@careerhub.dev",
      password,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      permissions: [
        "manage_all",
        "manage_admins",
        "manage_candidates",
        "manage_recruiters",
        "manage_jobs",
        "manage_applications",
      ],
      profile: {
        bio: "Root Super Administrator with full system control.",
      },
    },
    {
      id: "u1",
      name: "Aarav Sharma",
      email: "candidate@careerhub.dev",
      password,
      role: ROLES.CANDIDATE,
      phone: "9876543210",
      isActive: true,
      profile: {
        phone: "9876543210",
        location: "Bengaluru, India",
        bio: "Product-minded designer building useful experiences.",
        skills: ["Figma", "UX Research", "Prototyping"],
        experience: "5",
        department: "Computer Science",
        enrollmentNumber: "CH-2026-8841",
        education: "B.Tech Computer Science",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        postalCode: "560001",
        rating: 4.9,
        reviewsCount: 18,
      },
    },
    {
      id: "u2",
      name: "Riya Kapoor",
      email: "recruiter@careerhub.dev",
      password,
      role: ROLES.RECRUITER,
      phone: "9876543211",
      isActive: true,
      profile: {
        phone: "9876543211",
        location: "Mumbai, India",
        bio: "Connecting great people with great work.",
        skills: ["Hiring", "Sourcing"],
        experience: "6",
        department: "Human Resources & Talent",
        enrollmentNumber: "REC-2026-102",
        education: "MBA Human Resources",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400001",
        rating: 4.8,
        reviewsCount: 24,
      },
    },
    {
      id: "u3",
      name: "Platform Admin",
      email: "admin@careerhub.dev",
      password,
      role: ROLES.ADMIN,
      isActive: true,
      permissions: [
        "manage_candidates",
        "manage_recruiters",
        "manage_jobs",
        "manage_applications",
      ],
      profile: {},
    },
  );

  return fallbackUsers;
};

export const seedDemoUsers = async () => {
  if (mongoose.connection.readyState === 1) {
    const password = await bcrypt.hash("password123", 10);

    // 1. Check if Super Admin exists
    const superAdminExists = await User.findOne({
      role: { $in: [ROLES.SUPER_ADMIN, "super_admin", "superadmin"] },
    });

    if (!superAdminExists) {
      console.log("Seeding dedicated Single Super Admin...");
      await User.create({
        name: "Super Admin",
        email: "superadmin@careerhub.dev",
        password: "password123",
        role: ROLES.SUPER_ADMIN,
        isActive: true,
        permissions: [
          "manage_all",
          "manage_admins",
          "manage_candidates",
          "manage_recruiters",
          "manage_jobs",
          "manage_applications",
        ],
        profile: {
          bio: "Root Super Administrator with total system authority.",
        },
      });
      console.log("[AUTH] Super Admin created (superadmin@careerhub.dev / password123)");
    }

    // 2. Ensure existing demo users are seeded if DB is empty
    const existing = await User.countDocuments();
    if (existing <= 1) {
      await User.insertMany([
        {
          name: "Platform Admin",
          email: "admin@careerhub.dev",
          password,
          role: ROLES.ADMIN,
          isActive: true,
          permissions: [
            "manage_candidates",
            "manage_recruiters",
            "manage_jobs",
            "manage_applications",
          ],
          profile: {},
        },
        {
          name: "Aarav Sharma",
          email: "candidate@careerhub.dev",
          password,
          role: ROLES.CANDIDATE,
          phone: "9876543210",
          isActive: true,
          profile: {
            phone: "9876543210",
            location: "Bengaluru, India",
            bio: "Product-minded designer building useful experiences.",
            skills: ["Figma", "UX Research", "Prototyping"],
            experience: "5",
            department: "Computer Science",
            enrollmentNumber: "CH-2026-8841",
            education: "B.Tech Computer Science",
            city: "Bengaluru",
            state: "Karnataka",
            country: "India",
            postalCode: "560001",
            rating: 4.9,
            reviewsCount: 18,
          },
        },
        {
          name: "Riya Kapoor",
          email: "recruiter@careerhub.dev",
          password,
          role: ROLES.RECRUITER,
          phone: "9876543211",
          isActive: true,
          profile: {
            phone: "9876543211",
            location: "Mumbai, India",
            bio: "Connecting great people with great work.",
            skills: ["Hiring", "Sourcing"],
            experience: "6",
            department: "Human Resources & Talent",
            enrollmentNumber: "REC-2026-102",
            education: "MBA Human Resources",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            postalCode: "400001",
            rating: 4.8,
            reviewsCount: 24,
          },
        },
      ]);
    }

    // 3. Normalize any legacy lowercase roles in MongoDB
    await User.updateMany({ role: "candidate" }, { $set: { role: ROLES.CANDIDATE } });
    await User.updateMany({ role: "recruiter" }, { $set: { role: ROLES.RECRUITER } });
    await User.updateMany({ role: "admin" }, { $set: { role: ROLES.ADMIN } });
  }

  await seedFallbackUsers();
};

export const findByEmail = async (email) => {
  if (!email) return null;

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .lean();
    if (!user) return null;
    user.id = String(user._id);
    user.role = normalizeRole(user.role);
    return user;
  }

  await seedFallbackUsers();
  return (
    fallbackUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    ) || null
  );
};

export const findById = async (id) => {
  if (!id) return null;

  if (mongoose.connection.readyState === 1) {
    const user = mongoose.Types.ObjectId.isValid(id)
      ? await User.findById(id).lean()
      : await User.findOne({ _id: id }).lean();

    return user ? publicUser(user) : null;
  }

  await seedFallbackUsers();
  return fallbackUsers.find((user) => user.id === id) || null;
};

export const createUser = async ({
  name,
  email,
  password,
  role = ROLES.CANDIDATE,
  phone = "",
  permissions = undefined,
}) => {
  const normRole = normalizeRole(role);
  const sanitizedPhone = phone ? String(phone).replace(/\D/g, "").slice(0, 10) : "";
  const payload = {
    name,
    email: String(email).toLowerCase(),
    password,
    role: normRole,
    phone: sanitizedPhone,
    isActive: true,
    permissions:
      normRole === ROLES.ADMIN
        ? permissions || [
            "manage_candidates",
            "manage_recruiters",
            "manage_jobs",
            "manage_applications",
          ]
        : normRole === ROLES.SUPER_ADMIN
        ? [
            "manage_all",
            "manage_admins",
            "manage_candidates",
            "manage_recruiters",
            "manage_jobs",
            "manage_applications",
          ]
        : [],
    profile: {
      phone: sanitizedPhone,
      rating: 4.8,
      reviewsCount: 1,
    },
  };

  if (mongoose.connection.readyState === 1) {
    const createdUser = await User.create(payload);
    return publicUser(createdUser);
  }

  if (normRole === ROLES.SUPER_ADMIN) {
    const hasSA = fallbackUsers.some((u) => normalizeRole(u.role) === ROLES.SUPER_ADMIN);
    if (hasSA) {
      throw new Error("Security Violation: Only ONE Super Admin can exist.");
    }
  }

  const user = {
    id: `u${Date.now()}`,
    ...payload,
    password: await bcrypt.hash(password, 10),
  };
  fallbackUsers.push(user);
  return publicUser(user);
};

export const allUsers = async (filter = {}) => {
  if (mongoose.connection.readyState === 1) {
    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    return users.map((user) => publicUser(user));
  }

  await seedFallbackUsers();
  return fallbackUsers.map((user) => publicUser(user));
};

export const updateProfile = async (id, data) => {
  if (mongoose.connection.readyState === 1) {
    const existing = await User.findById(id);
    if (!existing) return null;

    if (data.name && typeof data.name === "string" && data.name.trim()) {
      existing.name = data.name.trim();
    }
    if (data.phone !== undefined) {
      const sanitizedPhone = data.phone ? String(data.phone).replace(/\D/g, "").slice(0, 10) : "";
      existing.phone = sanitizedPhone;
      data.phone = sanitizedPhone;
    }
    if (data.skills !== undefined && Array.isArray(data.skills)) {
      existing.skills = data.skills;
    }
    if (data.isActive !== undefined && existing.role !== ROLES.SUPER_ADMIN) {
      existing.isActive = Boolean(data.isActive);
    }
    if (data.permissions !== undefined && existing.role === ROLES.ADMIN) {
      existing.permissions = data.permissions;
    }

    const currentProfile = existing.profile ? existing.profile.toObject() : {};
    const updatedProfile = { ...currentProfile, ...data };

    existing.profile = updatedProfile;
    await existing.save();
    return publicUser(existing);
  }

  await seedFallbackUsers();
  const user = fallbackUsers.find((entry) => entry.id === id);
  if (!user) return null;
  if (data.name) user.name = data.name;
  if (data.phone !== undefined) {
    const sanitizedPhone = data.phone ? String(data.phone).replace(/\D/g, "").slice(0, 10) : "";
    user.phone = sanitizedPhone;
    data.phone = sanitizedPhone;
  }
  if (data.skills !== undefined) user.skills = data.skills;
  if (data.isActive !== undefined && normalizeRole(user.role) !== ROLES.SUPER_ADMIN) {
    user.isActive = Boolean(data.isActive);
  }
  if (data.permissions !== undefined && normalizeRole(user.role) === ROLES.ADMIN) {
    user.permissions = data.permissions;
  }
  user.profile = { ...(user.profile || {}), ...data };
  return publicUser(user);
};

export const updatePassword = async (id, plainPassword) => {
  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(id);
    if (!user) return null;
    user.password = plainPassword;
    await user.save();
    return publicUser(user);
  }

  await seedFallbackUsers();
  const user = fallbackUsers.find((entry) => entry.id === id);
  if (!user) return null;
  user.password = await bcrypt.hash(plainPassword, 12);
  return publicUser(user);
};
