# Mini Task Manager API

A REST API built with **Node.js + Express + MongoDB** that demonstrates backend fundamentals including file logging, custom EventEmitter, and a template-rendered UI.

---

## Tech Stack

| Layer         | Technology             |
|---------------|------------------------|
| Runtime       | Node.js                |
| Framework     | Express 4              |
| Database      | MongoDB + Mongoose     |
| Template      | EJS                    |
| Logging       | Node.js `fs` module    |
| Events        | Node.js `EventEmitter` |

---

## Project Structure

```
mini-task-manager/
├── app.js                    # Entry point
├── .env                      # Environment variables
├── package.json
├── logs/
│   └── logs.txt              # All request + event logs (auto-created)
├── public/
│   └── style.css             # UI styles
├── views/
│   └── tasks.ejs             # EJS template (task list UI)
└── src/
    ├── config/
    │   └── db.js             # MongoDB connection
    ├── controllers/
    │   └── taskController.js # CRUD logic
    ├── events/
    │   └── taskEvents.js     # Custom EventEmitter
    ├── middleware/
    │   └── logger.js         # Request logger (writes to logs.txt)
    ├── models/
    │   └── Task.js           # Mongoose schema
    └── routes/
        └── taskRoutes.js     # Express router
```

---

## Prerequisites

- Node.js >= 18
- MongoDB running locally on port `27017`
  - Install: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (update `MONGO_URI` in `.env`)

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (edit if needed)
# .env already has defaults: PORT=3000, MONGO_URI=mongodb://127.0.0.1:27017/taskmanager

# 3. Start the server
npm start

# 4. (Optional) Development mode with auto-reload
npm run dev
```

Server starts at: **http://localhost:3000**
UI page at: **http://localhost:3000/ui**

---

## API Endpoints

### Base URL: `http://localhost:3000`

| Method   | Endpoint      | Description        |
|----------|---------------|--------------------|
| `GET`    | `/`           | API info           |
| `POST`   | `/tasks`      | Create a task      |
| `GET`    | `/tasks`      | Get all tasks      |
| `GET`    | `/tasks/:id`  | Get task by ID     |
| `PUT`    | `/tasks/:id`  | Update a task      |
| `DELETE` | `/tasks/:id`  | Delete a task      |
| `GET`    | `/ui`         | UI (EJS template)  |

### Task Schema

```json
{
  "title":       "string (required, max 100 chars)",
  "description": "string (optional)",
  "status":      "pending | in-progress | completed  (default: pending)",
  "priority":    "low | medium | high               (default: medium)"
}
```

### Query Filters (GET /tasks)

```
GET /tasks?status=pending
GET /tasks?priority=high
GET /tasks?status=in-progress&priority=medium
```

---

## Sample API Calls (curl)

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread","priority":"high"}'

# Get all tasks
curl http://localhost:3000/tasks

# Get all pending tasks
curl "http://localhost:3000/tasks?status=pending"

# Get single task (replace ID)
curl http://localhost:3000/tasks/65f1a2b3c4d5e6f7a8b9c0d1

# Update a task
curl -X PUT http://localhost:3000/tasks/65f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/65f1a2b3c4d5e6f7a8b9c0d1
```

---

## Postman Collection

Import the following JSON into Postman:

```json
{
  "info": { "name": "Mini Task Manager", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "Create Task",
      "request": {
        "method": "POST", "url": "http://localhost:3000/tasks",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{\"title\":\"Sample Task\",\"description\":\"Details here\",\"status\":\"pending\",\"priority\":\"high\"}" }
      }
    },
    {
      "name": "Get All Tasks",
      "request": { "method": "GET", "url": "http://localhost:3000/tasks" }
    },
    {
      "name": "Get Task By ID",
      "request": { "method": "GET", "url": "http://localhost:3000/tasks/:id" }
    },
    {
      "name": "Update Task",
      "request": {
        "method": "PUT", "url": "http://localhost:3000/tasks/:id",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{\"status\":\"completed\",\"priority\":\"low\"}" }
      }
    },
    {
      "name": "Delete Task",
      "request": { "method": "DELETE", "url": "http://localhost:3000/tasks/:id" }
    }
  ]
}
```

---

## Feature Walkthrough

### 1. File System Logging (`src/middleware/logger.js`)
Every HTTP request is logged to `logs/logs.txt`:
```
[2024-01-15T10:30:00.000Z] REQUEST | POST /tasks | status=201 | 45ms
[2024-01-15T10:30:05.000Z] REQUEST | GET /tasks  | status=200 | 12ms
```

### 2. Custom EventEmitter (`src/events/taskEvents.js`)
Three custom events fire during task lifecycle:
- `task:created` → logs `"New Task Created"` with task details
- `task:updated` → logs task ID and new status
- `task:deleted` → logs deleted task ID

These events also write to `logs.txt`:
```
[2024-01-15T10:30:00.000Z] EVENT | New Task Created | id=65f1a... | title="Buy groceries"
```

### 3. EJS Template UI
Visit `http://localhost:3000/ui` to:
- View all tasks in a styled table
- Create tasks using a form
- Delete tasks with a button

---

## How to Debug

### Step 1 — Console Logs
The server prints labeled logs to the terminal:
```
[DB]         MongoDB connected: 127.0.0.1
[App]        Server running on http://localhost:3000
[Request]    POST /tasks → 201 (43ms)
[Event]      EVENT | New Task Created | id=... | title="..."
[Controller] createTask error: Title is required
```

### Step 2 — logs.txt
All requests and events are written to `logs/logs.txt`. Inspect it:
```bash
cat logs/logs.txt
```

### Step 3 — Node.js Inspector (VS Code / Chrome DevTools)
```bash
# Start with inspector
node --inspect app.js

# Then open Chrome → chrome://inspect
# Or in VS Code: Run > Start Debugging (with launch.json below)
```

VS Code `launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "program": "${workspaceFolder}/app.js",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### Step 4 — Environment Variables
Check `.env` is loaded:
```bash
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

### Step 5 — MongoDB Connection Issues
```bash
# Check MongoDB is running (Windows)
sc query MongoDB

# Or start it manually
mongod --dbpath C:\data\db
```

---

## Environment Variables

| Variable    | Default                                     | Description         |
|-------------|---------------------------------------------|---------------------|
| `PORT`      | `3000`                                      | Server port         |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/taskmanager`     | MongoDB connection  |
| `NODE_ENV`  | `development`                               | Environment name    |
