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
      avatarUrl: String,
      resumeUrl: String,
      resumeName: String,
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
    profile: {},
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
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { profile: { ...(await User.findById(id))?.profile, ...data } } },
      { new: true },
    ).lean();
    return user ? publicUser(user) : null;
  }

  await seedFallbackUsers();
  const user = fallbackUsers.find((entry) => entry.id === id);
  if (!user) return null;
  user.profile = { ...user.profile, ...data };
  return publicUser(user);
};
