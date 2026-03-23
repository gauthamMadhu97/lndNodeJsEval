const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class TaskEventEmitter extends EventEmitter {}

const taskEmitter = new TaskEventEmitter();

const logFilePath = path.join(__dirname, '../../logs/logs.txt');

const appendLog = (message) => {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error('Event log write failed:', err.message);
  });
};

taskEmitter.on('task:created', (task) => {
  const msg = `New Task Created | id=${task._id} | title="${task.title}"`;
  console.log(msg);
  appendLog(msg);
});

taskEmitter.on('task:updated', (task) => {
  const msg = `Task Updated | id=${task._id} | status=${task.status}`;
  console.log(msg);
  appendLog(msg);
});

taskEmitter.on('task:deleted', (id) => {
  const msg = `Task Deleted | id=${id}`;
  console.log(msg);
  appendLog(msg);
});

module.exports = taskEmitter;
