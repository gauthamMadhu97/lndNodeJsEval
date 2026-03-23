require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./src/config/db');
const requestLogger = require('./src/middleware/logger');
const taskRoutes = require('./src/routes/taskRoutes');
const Task = require('./src/models/Task');
const taskEmitter = require('./src/events/taskEvents');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use('/tasks', taskRoutes);

// UI routes — form-based so we use POST instead of PUT/DELETE
app.get('/ui', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render('tasks', { tasks });
  } catch (error) {
    console.error('Failed to load tasks:', error.message);
    res.status(500).send('Error loading tasks');
  }
});

app.post('/ui/tasks', async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const task = await Task.create({ title, description, status, priority });
    taskEmitter.emit('task:created', task);
    res.redirect('/ui');
  } catch (error) {
    console.error('Failed to create task:', error.message);
    res.status(500).send('Error creating task: ' + error.message);
  }
});

app.post('/ui/tasks/:id/edit', async (req, res) => {
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
    if (task) taskEmitter.emit('task:updated', task);
    res.redirect('/ui');
  } catch (error) {
    console.error('Failed to update task:', error.message);
    res.status(500).send('Error updating task: ' + error.message);
  }
});

app.post('/ui/tasks/:id/delete', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) taskEmitter.emit('task:deleted', req.params.id);
    res.redirect('/ui');
  } catch (error) {
    console.error('Failed to delete task:', error.message);
    res.status(500).send('Error deleting task');
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Mini Task Manager API',
    version: '1.0.0',
    endpoints: {
      ui: 'GET  /ui',
      createTask: 'POST /tasks',
      getAllTasks: 'GET  /tasks',
      getTask: 'GET  /tasks/:id',
      updateTask: 'PUT  /tasks/:id',
      deleteTask: 'DELETE /tasks/:id',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`UI: http://localhost:${PORT}/ui`);
});

module.exports = app;
