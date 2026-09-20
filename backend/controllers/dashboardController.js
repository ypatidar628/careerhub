import { allUsers, User } from "../models/userModel.js";
import { Job } from "../models/jobModel.js";
import { Application } from "../models/applicationModel.js";
import { SavedJob } from "../models/savedJobModel.js";
import { getNotificationsForUser } from "../models/notificationModel.js";
import { jobs as mockJobs, notifications as mockNotifs, messages as mockMessages } from "../data/mockData.js";
import mongoose from "mongoose";

export const dashboard = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  if (mongoose.connection.readyState === 1) {
    if (role === "admin") {
      const [totalUsers, candidates, recruiters, jobsCount, applicationsCount] =
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ role: "candidate" }),
          User.countDocuments({ role: "recruiter" }),
          Job.countDocuments(),
          Application.countDocuments(),
        ]);

      const users = await allUsers();

      return res.json({
        totalUsers,
        candidates,
        recruiters,
        jobs: jobsCount,
        applications: applicationsCount,
        interviews: await Application.countDocuments({ status: "Interview" }),
        users,
        auditLogs: [
          { action: "Platform active", actor: "System", time: "Just now" },
          { action: "Job indexed", actor: "Search engine", time: "1 hour ago" },
        ],
        activity: [
          { name: "Mon", value: 3 },
          { name: "Tue", value: 6 },
          { name: "Wed", value: 8 },
          { name: "Thu", value: 5 },
          { name: "Fri", value: 9 },
        ],
      });
    }

    if (role === "recruiter") {
      const [activeJobs, applicantsCount, shortlistedCount, interviewsCount, applicantsList] =
        await Promise.all([
          Job.countDocuments({ recruiterId: userId, status: "Active" }),
          Application.countDocuments({ recruiterId: userId }),
          Application.countDocuments({ recruiterId: userId, status: "Shortlisted" }),
          Application.countDocuments({ recruiterId: userId, status: "Interview" }),
          Application.find({ recruiterId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

      return res.json({
        activeJobs,
        applicants: applicantsCount,
        shortlisted: shortlistedCount,
        interviews: interviewsCount,
        funnel: [
          { name: "Applied", value: applicantsCount },
          { name: "Shortlisted", value: shortlistedCount },
          { name: "Interview", value: interviewsCount },
          { name: "Selected", value: await Application.countDocuments({ recruiterId: userId, status: "Selected" }) },
        ],
        applicantsList: applicantsList.map((app) => ({
          id: String(app._id),
          name: app.candidateName,
          role: app.jobTitle,
          score: app.score,
          stage: app.status,
        })),
        activity: [
          { name: "Mon", value: 2 },
          { name: "Tue", value: 4 },
          { name: "Wed", value: 6 },
          { name: "Thu", value: 5 },
          { name: "Fri", value: 7 },
        ],
      });
    }

    // Candidate
    const [applicationsCount, interviewsCount, savedCount, recentApplications] =
      await Promise.all([
        Application.countDocuments({ candidateId: userId }),
        Application.countDocuments({ candidateId: userId, status: "Interview" }),
        SavedJob.countDocuments({ candidateId: userId }),
        Application.find({ candidateId: userId })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
      ]);

    const recommended = await Job.find({ status: "Active" }).limit(3).lean();

    return res.json({
      applications: applicationsCount,
      interviews: interviewsCount,
      savedJobs: savedCount,
      profileStrength: 85,
      activity: [
        { name: "Mon", value: 1 },
        { name: "Tue", value: 3 },
        { name: "Wed", value: 2 },
        { name: "Thu", value: 4 },
        { name: "Fri", value: 5 },
      ],
      recommended: recommended.map((j) => ({ ...j, id: String(j._id) })),
      upcoming: recentApplications
        .filter((a) => a.status === "Interview")
        .map((a) => ({
          company: a.company,
          role: a.jobTitle,
          time: "Scheduled via recruiter",
        })),
    });
  }

  // Fallback
  return res.json({
    applications: 2,
    interviews: 1,
    savedJobs: 3,
    profileStrength: 80,
    activity: [
      { name: "Mon", value: 2 },
      { name: "Tue", value: 4 },
      { name: "Wed", value: 3 },
      { name: "Thu", value: 6 },
      { name: "Fri", value: 5 },
    ],
    recommended: mockJobs.slice(0, 3),
    upcoming: [
      {
        company: "Lumin Tech",
        role: "React Developer",
        time: "Tomorrow, 11:00 AM",
      },
    ],
  });
};

export const getNotifications = async (req, res) => {
  const notifs = await getNotificationsForUser(req.user.id);
  if (notifs.length) {
    return res.json({ notifications: notifs });
  }
  return res.json({ notifications: mockNotifs });
};

export const getMessages = (_req, res) => res.json({ messages: mockMessages });
