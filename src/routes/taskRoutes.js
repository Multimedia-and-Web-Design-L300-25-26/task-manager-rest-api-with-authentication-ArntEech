import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  // - Create task
  const { title, description} = req.body;

  if (!title)  {
    return res.status(400).json({ message: "Title is required" });
  }

  // - Attach owner = req.user._id
  const task = await Task.create({
    title,
    description,
    owner: req.user._id
  });

  res.status(201).json(task);
});

// GET /api/tasks - Get all tasks for the logged-in user 
router.get("/", async (req, res) => {
  // - Return only tasks belonging to req.user
  const tasks = await Task.find({ owner: req.user._id });
  res.status(200).json(tasks);
});

// DELETE /api/tasks/:id - Delete a task (only if owner)
router.delete("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);

  // - Check ownership
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // - Delete task
  await task.deleteOne();
  res.status(200).json({ message: "Task deleted "});
});

export default router;