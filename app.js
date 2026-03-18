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

// --- Connect to Database ---
connectDB();

// --- View Engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger); // logs every request to logs.txt

// --- API Routes ---
app.use('/tasks', taskRoutes);

// --- UI Routes (Template Engine) ---

// GET /ui → display all tasks in EJS view
app.get('/ui', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render('tasks', { tasks });
  } catch (error) {
    console.error('[UI] Failed to load tasks:', error.message);
    res.status(500).send('Error loading tasks');
  }
});

// POST /ui/tasks → create task via form, then redirect
app.post('/ui/tasks', async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const task = await Task.create({ title, description, status, priority });
    taskEmitter.emit('task:created', task);
    res.redirect('/ui');
  } catch (error) {
    console.error('[UI] Failed to create task:', error.message);
    res.status(500).send('Error creating task: ' + error.message);
  }
});

// POST /ui/tasks/:id/delete → delete via form (browsers only support GET/POST)
app.post('/ui/tasks/:id/delete', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) taskEmitter.emit('task:deleted', req.params.id);
    res.redirect('/ui');
  } catch (error) {
    console.error('[UI] Failed to delete task:', error.message);
    res.status(500).send('Error deleting task');
  }
});

// --- Root Redirect ---
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

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[App] Server running on http://localhost:${PORT}`);
  console.log(`[App] UI available at http://localhost:${PORT}/ui`);
  console.log(`[App] Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
