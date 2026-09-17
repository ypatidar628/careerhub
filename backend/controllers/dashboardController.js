import { allUsers } from "../models/userModel.js";
import { jobs as mockJobs, notifications, messages } from "../data/mockData.js";

export const dashboard = async (req, res) => {
  const users = await allUsers();
  const jobs = mockJobs;
  const common = {
    applications: 12,
    interviews: 3,
    savedJobs: 8,
    profileStrength: 78,
    activity: [
      { name: "Mon", value: 2 },
      { name: "Tue", value: 4 },
      { name: "Wed", value: 3 },
      { name: "Thu", value: 6 },
      { name: "Fri", value: 5 },
    ],
  };

  if (req.user.role === "admin") {
    return res.json({
      totalUsers: users.length,
      candidates: 1,
      recruiters: 1,
      jobs: jobs.length,
      applications: 48,
      interviews: 12,
      users,
      auditLogs: [
        { action: "Job published", actor: "Riya Kapoor", time: "2 hours ago" },
        {
          action: "Candidate registered",
          actor: "Aarav Sharma",
          time: "4 hours ago",
        },
      ],
      ...common,
    });
  }

  if (req.user.role === "recruiter") {
    return res.json({
      activeJobs: 4,
      applicants: 48,
      shortlisted: 15,
      interviews: 12,
      funnel: [
        { name: "Applied", value: 48 },
        { name: "Screened", value: 28 },
        { name: "Shortlisted", value: 15 },
        { name: "Interview", value: 12 },
      ],
      applicantsList: [
        {
          name: "Samira Khan",
          role: "Frontend Engineer",
          score: 92,
          stage: "Interview",
        },
        {
          name: "Dev Mehta",
          role: "Product Designer",
          score: 87,
          stage: "Shortlisted",
        },
      ],
      ...common,
    });
  }

  return res.json({
    ...common,
    recommended: jobs.slice(0, 3),
    upcoming: [
      {
        company: "Lumin",
        role: "Senior Product Designer",
        time: "Tomorrow, 11:00 AM",
      },
    ],
  });
};

export const getNotifications = (_req, res) => res.json({ notifications });
export const getMessages = (_req, res) => res.json({ messages });
