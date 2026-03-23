# Mini Task Manager API

A simple task management REST API built with Node.js, Express, and MongoDB. Has a basic UI at `/ui` for testing without Postman.

## Stack

- Node.js + Express
- MongoDB with Mongoose
- EJS for the UI page
- `fs` module for request logging
- Node.js `EventEmitter` for task lifecycle events

## Project Structure

```
├── app.js
├── .env
├── logs/logs.txt         <- auto-created on first run
├── public/style.css
├── views/tasks.ejs
└── src/
    ├── config/db.js
    ├── controllers/taskController.js
    ├── events/taskEvents.js
    ├── middleware/logger.js
    ├── models/Task.js
    └── routes/taskRoutes.js
```

## Setup

Make sure MongoDB is running locally (`mongod`), then:

```bash
npm install
cp .env.example .env
npm start
```

Runs on http://localhost:3000. UI is at http://localhost:3000/ui.

For dev with auto-restart: `npm run dev`

The default `.env` points to a local MongoDB instance. If you're using Atlas, swap `MONGO_URI` for your connection string.

## API

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | /tasks | create task |
| GET | /tasks | get all tasks |
| GET | /tasks/:id | get one task |
| PUT | /tasks/:id | update task |
| DELETE | /tasks/:id | delete task |

Task fields: `title` (required), `description`, `status` (pending/in-progress/completed), `priority` (low/medium/high)

You can filter with query params: `GET /tasks?status=pending&priority=high`

## curl examples

```bash
# create
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix login bug","description":"users getting 401 on refresh","priority":"high"}'

# get all
curl http://localhost:3000/tasks

# get one
curl http://localhost:3000/tasks/<id>

# update
curl -X PUT http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# delete
curl -X DELETE http://localhost:3000/tasks/<id>
```

## Postman Collection

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
        "body": { "mode": "raw", "raw": "{\"status\":\"completed\"}" }
      }
    },
    {
      "name": "Delete Task",
      "request": { "method": "DELETE", "url": "http://localhost:3000/tasks/:id" }
    }
  ]
}
```

## How to Debug

**Terminal logs** — the server logs every request and event to the console with the method, path, status, and duration. Errors include a label so you can tell where they came from (db, controller, etc).

**logs/logs.txt** — every request and task event gets appended here. Useful if you want to check what happened after the fact:
```bash
cat logs/logs.txt
```

**Node inspector** — run `node --inspect app.js`, then open `chrome://inspect` in Chrome. Or in VS Code, add this to `.vscode/launch.json` and hit F5:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug",
      "program": "${workspaceFolder}/app.js",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

**MongoDB not connecting?** Check it's actually running:
```bash
# Windows
sc query MongoDB
# or just run: mongod --dbpath C:\data\db
```
