# StudySmart — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **StudySmart** full-stack application to production cloud services (such as Render, Vercel, Railway, Azure, or AWS).

---

## 🏗️ Production Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Internet / Users      │
                          └────────────┬─────────────┘
                                       │
                                       ▼
                          ┌──────────────────────────┐
                          │  React Frontend (Vite)   │
                          │   (Vercel / Netlify /    │
                          │     Render Static)       │
                          └────────────┬─────────────┘
                                       │ HTTPS REST
                                       ▼
                          ┌──────────────────────────┐
                          │  ASP.NET Core REST API   │
                          │   (.NET 8 Web Service)   │
                          │   (Render / Railway /    │
                          │      Azure App Svc)      │
                          └─────┬──────────────┬─────┘
                                │              │
           SQL Server Connection│              │REST API Calls
                                ▼              ▼
              ┌───────────────────┐    ┌────────────────────┐
              │  Cloud SQL Server │    │  sessions-backend  │
              │  (Azure SQL /     │    │  (Node.js/Express) │
              │   Aiven / AWS)    │    │  (Render / Railway)│
              └───────────────────┘    └────────────────────┘
```

---

## 📋 Prerequisites

Before starting, ensure you have:
1. A GitHub account with access to the [StudySmart Repository](https://github.com/pateljiya1959/studysmart).
2. Accounts on hosting platforms:
   - **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com) or [Render](https://render.com)
   - **Backend API**: [Render](https://render.com), [Railway](https://railway.app), or [Azure App Service](https://azure.microsoft.com)
   - **Database**: [Azure SQL Database](https://azure.microsoft.com/services/sql-database/), [Aiven for SQL Server](https://aiven.io), or AWS RDS.
3. [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) and [Node.js (v18+)](https://nodejs.org) installed locally for migrations.

---

## 🔑 Required Environment Variables Summary

### 1. ASP.NET Core Backend (`ReactApp1.Server`)
| Variable Name | Description | Example Value |
|---|---|---|
| `ConnectionStrings__Conn` | Production SQL Server Connection String | `Server=tcp:studysmart.database.windows.net,1433;Initial Catalog=studentdb;User ID=admin;Password=SecretPassword123!;` |
| `Jwt__Key` | Secret key for signing JWT tokens (min 32 chars) | `SUPER_SECRET_PRODUCTION_JWT_KEY_32_CHARS_LONG` |
| `Jwt__Issuer` | JWT Token Issuer | `StudySmartAPI` |
| `Jwt__Audience` | JWT Token Audience | `StudySmartClient` |
| `EmailSettings__EmailUser` | Gmail address for sending OTP emails | `your-email@gmail.com` |
| `EmailSettings__EmailPass` | Gmail App Password (16 characters) | `abcd efgh ijkl mnop` |
| `AiSettings__OpenAIKey` | OpenAI API key for AI exam evaluation | `sk-proj-xxxxxxxxxxxxxxxxxxxx` |
| `AllowedOrigins__0` | Production React Frontend URL | `https://studysmart-app.vercel.app` |

### 2. React Frontend (`reactapp1.client`)
| Variable Name | Description | Example Value |
|---|---|---|
| `VITE_API_URL` | Deployed ASP.NET Core API Base URL | `https://studysmart-api.onrender.com/api` |
| `VITE_NODE_API_URL` | Deployed sessions-backend URL | `https://studysmart-sessions.onrender.com` |

### 3. Sessions Backend (`sessions-backend`)
| Variable Name | Description | Example Value |
|---|---|---|
| `PORT` | Listening port (injected by host) | `5000` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://studysmart-app.vercel.app` |
| `MONGODB_URI` | MongoDB Connection String (Optional; leaves empty for in-memory) | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key matching ASP.NET JWT | `SUPER_SECRET_PRODUCTION_JWT_KEY_32_CHARS_LONG` |
| `EMAIL_USER` | Email address for sessions OTP | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |

---

## 🗄️ Step 1: Database Setup & EF Core Migrations

1. **Create Cloud SQL Server**:
   - Provision an Azure SQL Database or Aiven SQL Server instance.
   - Note the host, database name (`studentdb`), server admin username, and password.

2. **Configure Firewall**:
   - Allow your hosting platform's IP addresses (or check "Allow Azure services and resources to access this server" in Azure).

3. **Apply EF Core Migrations**:
   Run the following terminal command from your local machine, pointing to your production database:
   ```bash
   dotnet ef database update --project ReactApp1.Server --connection "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=studentdb;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;"
   ```

---

## 🚀 Step 2: ASP.NET Core Backend Deployment (`ReactApp1.Server`)

### Option A: Render (Web Service Docker or Native .NET)
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New Web Service**.
2. Connect your GitHub Repository: `https://github.com/pateljiya1959/studysmart`.
3. Choose **Dockerfile** as Environment (uses the repository's root `Dockerfile`).
4. Set Instance Type to **Free / Starter**.
5. Under **Environment Variables**, add:
   - `ConnectionStrings__Conn` = `<YOUR_PRODUCTION_SQL_SERVER_CONNECTION_STRING>`
   - `Jwt__Key` = `<YOUR_SECURE_JWT_SECRET>`
   - `Jwt__Issuer` = `StudySmartAPI`
   - `Jwt__Audience` = `StudySmartClient`
   - `EmailSettings__EmailUser` = `<YOUR_GMAIL>`
   - `EmailSettings__EmailPass` = `<YOUR_GMAIL_APP_PASSWORD>`
   - `AiSettings__OpenAIKey` = `<YOUR_OPENAI_KEY>`
   - `AllowedOrigins__0` = `<YOUR_DEPLOYED_FRONTEND_URL>`
6. Click **Deploy Web Service**.
7. Note your API URL: `https://studysmart-api.onrender.com`.

---

## 💻 Step 3: React Frontend Deployment (`reactapp1.client`)

### Option A: Vercel / Netlify
1. Log in to [Vercel](https://vercel.com) → **Add New Project**.
2. Import the GitHub repository `pateljiya1959/studysmart`.
3. Set **Root Directory** to `reactapp1.client`.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://studysmart-api.onrender.com/api`
   - `VITE_NODE_API_URL` = `https://studysmart-sessions.onrender.com`
6. Click **Deploy**.
7. Note your Live App URL: `https://studysmart-app.vercel.app`.

---

## 📅 Step 4: Sessions Backend Deployment (`sessions-backend`)

1. Go to Render Dashboard → **New Web Service**.
2. Connect the GitHub repository.
3. Set **Root Directory** to `sessions-backend`.
4. Environment: **Node**.
5. Build Command: `npm install`.
6. Start Command: `node server.js`.
7. Environment Variables:
   - `CORS_ORIGIN` = `https://studysmart-app.vercel.app`
   - `JWT_SECRET` = `<YOUR_SECURE_JWT_SECRET>`
   - `EMAIL_USER` = `<YOUR_GMAIL>`
   - `EMAIL_PASS` = `<YOUR_GMAIL_APP_PASSWORD>`
8. Click **Deploy Web Service**.

---

## 🧪 Step 5: How to Test the Live Application

1. **Backend Health Check**:
   Open browser at: `https://<YOUR_API_URL>/health`
   Expected response: `{"status":"ok","service":"StudySmart API"}`

2. **Swagger UI**:
   Open browser at: `https://<YOUR_API_URL>/swagger`
   Verify API endpoints are listed.

3. **Frontend Application**:
   Open browser at: `https://<YOUR_FRONTEND_URL>`
   - Register a student account and mentor account.
   - Login and verify redirection to Student/Mentor dashboard.
   - Test Exam creation, Study Timer, and Assignment submissions.

---

## 🔄 Step 6: Redeployment & Maintenance Workflow

Whenever you commit and push changes to GitHub:
```bash
git add .
git commit -m "Update feature XYZ"
git push origin main
```
Both Vercel and Render will automatically trigger a new production build and zero-downtime deployment.
