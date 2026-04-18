import { getNextSequence } from "../utils/ids.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function createAdminCrudController({
  model,
  resourceName,
  counterKey,
  beforeDelete
}) {
  return {
    list: asyncHandler(async (req, res) => {
      const [sortField, sortOrder] = parseJson(req.query.sort, ["id", "ASC"]);
      const [start, end] = parseJson(req.query.range, [0, 24]);
      const filters = parseJson(req.query.filter, {});
      const query = Object.entries(filters).reduce((accumulator, [key, value]) => {
        if (key === "q" && typeof value === "string" && value.trim()) {
          accumulator.$or = [
            { title: { $regex: value, $options: "i" } },
            { question: { $regex: value, $options: "i" } },
            { text: { $regex: value, $options: "i" } }
          ];
          return accumulator;
        }

        accumulator[key] = Array.isArray(value) ? { $in: value } : value;
        return accumulator;
      }, {});

      const total = await model.countDocuments(query);
      const items = await model
        .find(query)
        .sort({ [sortField]: sortOrder === "ASC" ? 1 : -1 })
        .skip(start)
        .limit(end - start + 1)
        .lean();

      const endRange = items.length ? start + items.length - 1 : start;

      res.set("Content-Range", `${resourceName} ${start}-${endRange}/${total}`);
      res.set("Access-Control-Expose-Headers", "Content-Range");
      res.json(items);
    }),
    getOne: asyncHandler(async (req, res) => {
      const item = await model.findOne({ id: Number(req.params.id) }).lean();
      res.json(item);
    }),
    create: asyncHandler(async (req, res) => {
      const data = await model.create({
        ...req.body,
        id: await getNextSequence(counterKey)
      });

      res.status(201).json(data.toObject());
    }),
    update: asyncHandler(async (req, res) => {
      const data = await model
        .findOneAndUpdate({ id: Number(req.params.id) }, req.body, {
          new: true,
          runValidators: true
        })
        .lean();

      res.json(data);
    }),
    remove: asyncHandler(async (req, res) => {
      const id = Number(req.params.id);

      if (beforeDelete) {
        await beforeDelete(id);
      }

      const data = await model.findOneAndDelete({ id }).lean();
      res.json(data);
    })
  };
}
