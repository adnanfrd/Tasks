import express from "express";
import mongoose from "mongoose";
import Task from "../models/taskModel.js";

const router = express.Router();

// GET /api/tasks?limit=10&cursor=<last_id>&status=done
router.get("/", async (req, res, next) => {
  try {
    let { limit = 10, cursor, status } = req.query;

    // ✅ Validate limit
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: "limit must be between 1 and 50" });
    }

    // ✅ Validate status
    const validStatuses = ["todo", "doing", "done"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = {};
    if (status) query.status = status;

    // ✅ Cursor pagination
    if (cursor) {
      if (!mongoose.Types.ObjectId.isValid(cursor)) {
        return res.status(400).json({ error: "Invalid cursor" });
      }
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const items = await Task.find(query)
      .sort({ createdAt: -1, _id: -1 }) // consistent ordering
      .limit(limit + 1) // fetch one extra to check if more exist
      .select("title status priority createdAt");

    let nextCursor = null;
    if (items.length > limit) {
      nextCursor = items[limit - 1]._id;
      items.pop(); // remove extra item
    }

    res.json({ items, nextCursor });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, status, priority } = req.body;
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    if (status && !["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({ error: "invalid status" });
    }

    const task = new Task({ title, status, priority });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

export default router;
