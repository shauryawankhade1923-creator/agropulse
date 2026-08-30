# 🚀 AgroPulse Vercel & Cloud Deployment Guide

This guide provides step-by-step instructions for deploying AgroPulse live.

---

## ⚡ Option 1: Deploy Frontend on Vercel (Recommended - 2 Minutes)

### Method A: Deploy via GitHub (1-Click Automated CI/CD)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy AgroPulse on Vercel"
   git push origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and log in.
3. Click **"Add New..."** $\rightarrow$ **"Project"** $\rightarrow$ Select your **AgroPulse** repository.
4. Set the **Root Directory** to `frontend` (or leave default if deploying monorepo).
5. (Optional) In **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com` (or your deployed backend URL).
6. Click **"Deploy"**!
   - Vercel will build and assign you a live URL: `https://agropulse-xxxx.vercel.app`.

---

### Method B: Deploy Directly via Vercel CLI
From your terminal:
```bash
cd frontend
npx vercel
```
- Select your Vercel account.
- Link to existing project? `No` (or `Yes` if updating).
- Project name: `agropulse`
- Directory: `./`
- Want to modify settings? `No`
- To deploy to production: `npx vercel --prod`

---

## 🐍 Option 2: Deploy FastAPI Backend (Free on Render / Railway / Koyeb)

### Deploying Backend on Render (Free)
1. Go to **[render.com](https://render.com)** $\rightarrow$ **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   - `SECRET_KEY`: `agropulse-secure-key-2026`
   - `FAST2SMS_API_KEY`: `HS0hpCI9UABReraGz6jVmxgqfXN3n47vMbZE5Quyw1DT2FJdto2LB8PFRXKde1TyIl3gZGWYJQD04cVw`
   - `TWILIO_ACCOUNT_SID`: (Optional)
   - `TWILIO_AUTH_TOKEN`: (Optional)
5. Click **"Create Web Service"**.
6. Copy your Render backend URL (e.g., `https://agropulse-api.onrender.com`) and paste it as `VITE_API_URL` in your Vercel frontend project settings!

---

## 🔄 Updating Deployed App
Whenever you push new code to your GitHub `main` branch, Vercel automatically rebuilds and updates your live website in seconds with zero downtime.
