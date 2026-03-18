const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class TaskEventEmitter extends EventEmitter {}

const taskEmitter = new TaskEventEmitter();

const logFilePath = path.join(__dirname, '../../logs/logs.txt');

// Helper to append a line to logs.txt
const appendLog = (message) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error('[EventEmitter] Failed to write log:', err.message);
  });
};

// Event: task created
taskEmitter.on('task:created', (task) => {
  const msg = `EVENT | New Task Created | id=${task._id} | title="${task.title}"`;
  console.log(`[Event] ${msg}`);
  appendLog(msg);
});

// Event: task updated
taskEmitter.on('task:updated', (task) => {
  const msg = `EVENT | Task Updated | id=${task._id} | title="${task.title}" | status=${task.status}`;
  console.log(`[Event] ${msg}`);
  appendLog(msg);
});

// Event: task deleted
taskEmitter.on('task:deleted', (id) => {
  const msg = `EVENT | Task Deleted | id=${id}`;
  console.log(`[Event] ${msg}`);
  appendLog(msg);
});

module.exports = taskEmitter;
