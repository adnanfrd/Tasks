import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
  priority: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});


TaskSchema.index({ createdAt: -1, status: 1 });

const Task = mongoose.model("Task", TaskSchema);

export default Task;
