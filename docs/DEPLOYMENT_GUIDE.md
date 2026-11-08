# 🚀 Complete Deployment Guide - Algions School Management System

This guide outlines how to deploy the **Algions School Management System** to production hosting platforms completely free and with zero configuration friction.

---

## Option 1: 1-Click Deployment via Render (Recommended)

Render is the optimal cloud platform for this project because it natively deploys **PostgreSQL + Node.js Backend API + React Frontend** using the bundled [`render.yaml`](../render.yaml) Blueprint.

### Step-by-Step Instructions:
1. Create a free account at **[render.com](https://render.com)**.
2. In the Render Dashboard, click **New +** and select **Blueprint**.
3. Connect your GitHub repository:
   ```
   https://github.com/Bunty3545/-Algions-School-Management-System-
   ```
4. Render automatically parses `render.yaml` and provisions:
   - **`algions-sms-postgres`**: Managed PostgreSQL database.
   - **`algions-sms-backend`**: Node.js Express REST API (`https://algions-sms-backend.onrender.com`).
   - **`algions-sms-frontend`**: React Vite Static Site (`https://algions-sms-frontend.onrender.com`).
5. Click **Apply**.
6. Render builds the TypeScript backend, runs `npx prisma db push`, seeds synthetic school data, builds the Vite frontend, and provides your live public URLs!

---

## Option 2: Frontend on Vercel + Backend on Render

If you prefer hosting the client on **Vercel** (`.vercel.app`):
1. Import your GitHub repository into **[vercel.com](https://vercel.com)**.
2. Set **Root Directory** to `frontend`.
3. In the environment variables, set:
   ```
   VITE_API_URL=https://algions-sms-backend.onrender.com/api
   ```
4. Click **Deploy**. Vercel uses the included [`frontend/vercel.json`](../frontend/vercel.json) to handle client-side routing.

---

## Option 3: Containerized Docker & Docker Compose (Any VPS / Cloud)

For deployment on any Linux VPS (AWS EC2, DigitalOcean, Hetzner, Linode, or Google Cloud Compute Engine):

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/Bunty3545/-Algions-School-Management-System-.git
   cd -Algions-School-Management-System-
   ```
2. Run Docker Compose:
   ```bash
   docker compose up -d --build
   ```
3. Docker starts:
   - **PostgreSQL 16**: Port `5432` with healthcheck.
   - **Backend API**: Port `5000` with automatic DB sync and seed.
   - **Nginx Frontend**: Port `80` with SPA routing and `/api/` reverse proxy.

---

## 🔑 Production Environment Variables Reference

| Variable | Default / Production Value | Purpose |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `NODE_ENV` | `production` | Production optimizations flag |
| `DATABASE_URL` | `postgresql://...` | Managed PostgreSQL connection string |
| `JWT_SECRET` | Strong random string (min 32 chars) | HMAC SHA256 signing secret for JWTs |
| `JWT_EXPIRES_IN` | `7d` | Bearer token validity period |
| `CORS_ORIGIN` | `*` or your frontend domain | Allowed cross-origin domain |
