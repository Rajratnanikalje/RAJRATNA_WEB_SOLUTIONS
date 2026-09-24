import Service from "../models/Service.js";
import Project from "../models/Project.js";
import Technology from "../models/Technology.js";
import Enquiry from "../models/Enquiry.js";
import View from "../models/View.js";

export async function dashboard(req, res) {
  const [projects, services, enquiries, technologies, publishedProjects, newEnquiries, views, recentEnquiries, recentProjects] = await Promise.all([
    Project.countDocuments(),
    Service.countDocuments(),
    Enquiry.countDocuments(),
    Technology.countDocuments(),
    Project.countDocuments({ published: true }),
    Enquiry.countDocuments({ status: { $in: ["New", "NEW"] } }),
    View.aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }]),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).select("name email status createdAt"),
    Project.find().sort({ displayOrder: 1, createdAt: -1 }).limit(5).select("name title published"),
  ]);
  res.json({ data: {
    stats: { projects, services, enquiries, technologies, publishedProjects, newEnquiries, views: views[0]?.total || 0 },
    recentEnquiries,
    recentProjects,
  } });
}

export async function view(req, res) {
  const day = new Date().toISOString().slice(0, 10);
  await View.findOneAndUpdate({ day }, { $inc: { count: 1 } }, { upsert: true });
  res.status(204).end();
}
