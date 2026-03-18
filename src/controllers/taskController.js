const Task = require('../models/Task');
const taskEmitter = require('../events/taskEvents');

// POST /tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const task = await Task.create({ title, description, status, priority });

    // Fire custom event
    taskEmitter.emit('task:created', task);

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('[Controller] createTask error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('[Controller] getAllTasks error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error('[Controller] getTaskById error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    taskEmitter.emit('task:updated', task);

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error('[Controller] updateTask error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    taskEmitter.emit('task:deleted', req.params.id);

    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('[Controller] deleteTask error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
