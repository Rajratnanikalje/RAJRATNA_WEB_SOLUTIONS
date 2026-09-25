import Service from "../models/Service.js";
import Project from "../models/Project.js";
import Technology from "../models/Technology.js";

const models = {
  services: Service,
  projects: Project,
  technologies: Technology,
};
const fields = {
  services: ["title", "description", "imageUrl", "published", "displayOrder"],
  projects: [
    "name",
    "title",
    "category",
    "description",
    "fullDescription",
    "technologies",
    "url",
    "githubUrl",
    "imageUrl",
    "published",
    "featured",
    "displayOrder",
  ],
  technologies: ["name", "category", "iconUrl", "published", "displayOrder"],
};
const order = { displayOrder: 1, createdAt: -1 };

const pick = (type, body) =>
  Object.fromEntries(
    fields[type]
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );

export async function list(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({ data: await models[req.params.type].find().sort(order) });
}

export async function pub(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({
    data: await models[req.params.type].find({ published: true }).sort(order),
  });
}

export async function save(req, res) {
  res.set("Cache-Control", "no-store");
  const model = models[req.params.type];
  const data = pick(req.params.type, req.body);
  for (const key of ["url", "githubUrl"]) {
    if (data[key] && !/^https?:\/\//i.test(data[key])) {
      return res
        .status(422)
        .json({ message: `${key} must be a valid http or https URL` });
    }
  }
  for (const key of ["imageUrl", "iconUrl"]) {
    if (data[key] && !/^https?:\/\//i.test(data[key])) {
      return res
        .status(422)
        .json({ message: `${key} must be a valid image URL` });
    }
  }
  if (
    data.displayOrder !== undefined &&
    (!Number.isFinite(Number(data.displayOrder)) ||
      Number(data.displayOrder) < 0)
  ) {
    return res
      .status(422)
      .json({ message: "Display order must be a non-negative number" });
  }
  if (
    data.technologies &&
    (!Array.isArray(data.technologies) || data.technologies.length > 30)
  ) {
    return res
      .status(422)
      .json({ message: "Technologies must be a list of up to 30 items" });
  }
  const item = req.params.id
    ? await model.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
      })
    : await model.create(data);
  if (!item) return res.status(404).json({ message: "Record not found" });
  res.status(req.params.id ? 200 : 201).json({ data: item });
}

export async function del(req, res) {
  const item = await models[req.params.type].findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Record not found" });
  res.json({ message: "Deleted" });
}
