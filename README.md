# StudySmart — Full-Stack Educational Platform

StudySmart is a modern, full-stack web application designed to connect students with academic mentors, facilitate online exam evaluations, manage assignments, track study habits, and provide real-time performance analytics.

---

## 🌟 Live Demo & Links

- 🌐 **Live Web Application**: https://studysmart-gold.vercel.app/
- 🔌 **Swagger API Documentation**: `<TO_BE_ADDED>/swagger`
- 📘 **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📚 **Project Documentation**: [StudySmart Cover Document](https://github.com/user-attachments/files/31113334/StudySmart_Cover.docx)

---

## ✨ Features

### 🎓 Student Dashboard
- **Mentor Discovery & Requests**: Search mentors by expertise and request mentorship sessions.
- **Exams & Quizzes**: Take scheduled multiple-choice and subjective exams with real-time timers.
- **AI Subjective Answer Evaluation**: Automated feedback and scoring using OpenAI integration.
- **Study Habits & Analytics**: Study timer, habit tracker, and weekly/monthly performance graphs.
- **Assignment Submissions**: View assigned tasks, submit file attachments, and track grades.
- **Notes & Resource Library**: Save study links, lecture slides, and download materials.

### 👨‍🏫 Mentor Dashboard
- **Student Management**: View assigned students, track their progress, and review analytics.
- **Exam Builder**: Create custom exams with multiple question types, answer keys, and pass criteria.
- **Assignment Creation & Grading**: Assign homework, review student file uploads, and provide feedback.
- **Availability & Session Scheduling**: Define available time slots and host live video study sessions.
- **Guidance & Feedback**: Send personalized feedback and task recommendations to students.

### 🛡️ Admin Dashboard
- **User Governance**: Approve mentor applications, toggle user statuses, and assign roles.
- **Platform Analytics**: Monitor overall platform user growth, session conflict detection, and skill catalogs.
- **Announcements**: Broadcast system-wide notices to students and mentors.
- **System Maintenance**: Trigger analytics recalculations and fix orphaned records.

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS, Chart.js / Recharts, React Router v7 |
| **Backend API** | ASP.NET Core (.NET 8 Web API), Entity Framework Core 8 |
| **Sessions Backend** | Node.js, Express.js, MongoDB / In-Memory Fallback |
| **Database** | Microsoft SQL Server |
| **Authentication** | JWT (JSON Web Tokens), ASP.NET Identity PasswordHasher |
| **AI Integration** | OpenAI API (Subjective Exam Evaluation) |
| **Email Service** | SMTP (Gmail App Passwords) for OTP verification |
| **Containerization** | Docker (Multi-stage build) |

---

## 🏛️ System Architecture

```
                          Internet / Users
                                 │
                                 ▼
                       React 19 Frontend (Vite)
                                 │
                        HTTPS / REST API
                                 ▼
                     ASP.NET Core REST API (.NET 8)
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
  Microsoft SQL Server                        sessions-backend
   (EF Core 8 ORM)                           (Node.js / Express)
```

---

## 🚀 Installation & Local Development

### 1. Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+)](https://nodejs.org)
- [SQL Server (LocalDB or Express)](https://www.microsoft.com/sql-server/)

### 2. Clone Repository
```bash
git clone https://github.com/pateljiya1950-art/studysmart.git
cd studysmart
```

### 3. Backend Setup (`ReactApp1.Server`)
```bash
cd ReactApp1.Server
dotnet restore
dotnet run
```
The API server will launch on `https://localhost:7214` and `http://localhost:5259`.
Swagger UI is available at `https://localhost:7214/swagger`.

### 4. Frontend Setup (`reactapp1.client`)
```bash
cd reactapp1.client
npm install
npm run dev
```
The React frontend application will launch on `https://localhost:63349`.

### 5. Sessions Backend Setup (`sessions-backend`)
```bash
cd sessions-backend
npm install
npm run dev
```
The sessions backend server will run on `http://localhost:5000`.

---

## 📖 API Documentation

The REST API endpoints are documented interactively via Swagger UI:
- Local: `https://localhost:7214/swagger`
- Production: `<TO_BE_ADDED>/swagger`

Key API routes:
- `POST /api/auth/register` — User Registration
- `POST /api/auth/login` — User Authentication & JWT Generation
- `GET /health` — Application Health Check

---

## 🗄️ Database

Database migrations are managed via Entity Framework Core 8.

To update local database schema:
```bash
dotnet ef database update --project ReactApp1.Server
```

---

## 🧪 Testing

### Frontend Production Build Test
```bash
cd reactapp1.client
npm run build
```

### Backend Production Build Test
```bash
dotnet publish ReactApp1.Server/ReactApp1.Server.csproj -c Release
```

---

## 🚢 Deployment

Detailed instructions for deploying the frontend, backend, database, and environment variables are documented in [DEPLOYMENT.md](./DEPLOYMENT.md).

