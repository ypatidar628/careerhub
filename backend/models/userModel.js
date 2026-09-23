import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
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

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
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
  return plain;
};

const seedFallbackUsers = async () => {
  if (fallbackUsers.length) return fallbackUsers;

  const password = await bcrypt.hash("password123", 10);
  fallbackUsers.push(
    {
      id: "u1",
      name: "Aarav Sharma",
      email: "candidate@careerhub.dev",
      password,
      role: "candidate",
      profile: {
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
      role: "recruiter",
      profile: {
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
      role: "admin",
      profile: {},
    },
  );

  return fallbackUsers;
};

export const seedDemoUsers = async () => {
  if (mongoose.connection.readyState === 1) {
    const existing = await User.countDocuments();
    if (existing > 0) return;

    const password = await bcrypt.hash("password123", 10);
    await User.insertMany([
      {
        name: "Aarav Sharma",
        email: "candidate@careerhub.dev",
        password,
        role: "candidate",
        profile: {
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
        role: "recruiter",
        profile: {
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
        name: "Platform Admin",
        email: "admin@careerhub.dev",
        password,
        role: "admin",
        profile: {},
      },
    ]);
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
  role = "candidate",
}) => {
  const payload = {
    name,
    email: String(email).toLowerCase(),
    password,
    role,
    profile: {
      rating: 4.8,
      reviewsCount: 1,
    },
  };

  if (mongoose.connection.readyState === 1) {
    const createdUser = await User.create(payload);
    return publicUser(createdUser);
  }

  const user = {
    id: `u${Date.now()}`,
    ...payload,
    password: await bcrypt.hash(password, 10),
  };
  fallbackUsers.push(user);
  return publicUser(user);
};

export const allUsers = async () => {
  if (mongoose.connection.readyState === 1) {
    const users = await User.find({}).lean();
    return users.map((user) => publicUser(user));
  }

  await seedFallbackUsers();
  return fallbackUsers.map((user) => publicUser(user));
};

export const updateProfile = async (id, data) => {
  if (mongoose.connection.readyState === 1) {
    const existing = await User.findById(id);
    if (!existing) return null;

    // If top-level fields like name, phone, or skills are present
    if (data.name && typeof data.name === "string" && data.name.trim()) {
      existing.name = data.name.trim();
    }
    if (data.phone !== undefined) {
      existing.phone = data.phone;
    }
    if (data.skills !== undefined && Array.isArray(data.skills)) {
      existing.skills = data.skills;
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
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.skills !== undefined) user.skills = data.skills;
  user.profile = { ...(user.profile || {}), ...data };
  return publicUser(user);
};
