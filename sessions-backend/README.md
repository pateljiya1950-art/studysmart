# 📅 Session Scheduling System — Setup Guide

## Architecture

```
ReactApp1/
├── sessions-backend/          ← Node.js + Express + MongoDB (port 5001)
│   ├── server.js
│   ├── .env
│   ├── models/Session.js
│   ├── routes/sessions.js
│   └── controllers/sessionController.js
│
└── reactapp1.client/src/
    ├── services/sessionApi.js                          ← API client
    ├── pages/MentorDashboard/MentorSessions.jsx        ← Schedule sessions
    ├── pages/MentorDashboard/Sessions.css
    ├── pages/StudentDashboard/StudentSessions.jsx      ← Join sessions
    └── pages/StudentDashboard/StudentSessions.css
```

---

## REST API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/sessions/create` | Mentor creates a session |
| `GET` | `/api/sessions/student/:studentId` | Student's sessions |
| `GET` | `/api/sessions/mentor/:mentorId` | Mentor's sessions |
| `DELETE` | `/api/sessions/:id` | Delete a session |

### Session Schema (MongoDB)
```json
{
  "title":       "React Hooks Deep Dive",
  "date":        "2026-04-10",
  "startTime":   "14:00",
  "endTime":     "15:30",
  "meetingLink": "https://meet.google.com/xxx-xxxx-xxx",
  "mentorId":    "42",
  "mentorName":  "John Smith",
  "studentId":   "7",
  "studentName": "Jane Doe"
}
```

---

## Running the Backend

### Prerequisites
- MongoDB running locally on port 27017 **OR** update `.env` with a MongoDB Atlas URI

### Steps
```powershell
# 1. Navigate to backend
cd d:\project\ReactApp1\sessions-backend

# 2. Start (production)
npm start

# 3. Start (development with auto-reload)
npm run dev
```

The backend starts on **http://localhost:5001**

### Configure `.env`
```env
MONGODB_URI=mongodb://localhost:27017/studysmart_sessions
PORT=5001
CORS_ORIGIN=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/studysmart_sessions
```

---

## Join Button Logic

```
Current time < startTime  →  ⏳ "Not Started Yet"  (disabled)
startTime ≤ now ≤ endTime →  🚀 "Join Session"      (active, opens meetingLink)
Current time > endTime    →  ✓  "Session Ended"     (disabled)
```

The button status is **reactive** — it auto-flips without a page reload using a 1-second interval inside the component.

---

## Frontend Features

### Mentor Panel (`/mentor/sessions`)
- ➕ Schedule a session (title, student, date, start/end time, meeting link)
- 📊 Stats bar (total / upcoming / live / completed)
- 🗑 Delete sessions
- 🔴 Live pulse animation on active sessions

### Student Dashboard (`/student/sessions`)
- 🔍 Filter tabs: All / Upcoming / Live / Ended
- ⏰ Live countdown to session start
- 🔴 Animated live indicator
- 🚀 One-click join (opens meeting link in new tab)
- ↺ Manual refresh button
