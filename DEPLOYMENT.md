# Deployment Guide (fastest path — do this today)

Total time: ~20-30 minutes. You need three free accounts: GitHub, Railway, Vercel.

## 1. Push to GitHub
```bash
cd support-ticket-system
git init
git add .
git commit -m "Initial commit: full-stack support ticket system"
git branch -M main
git remote add origin https://github.com/<your-username>/support-ticket-system.git
git push -u origin main
```
Make a few more commits as you go (e.g. after adding tests, after deployment) — the assessment wants a real commit history, not one giant upload.
Make sure the repo is **Public** (or grant the evaluator access) in GitHub Settings.

## 2. Database — Railway MySQL
1. Go to railway.app → sign in with GitHub → **New Project** → **Provision MySQL**.
2. Click the MySQL service → **Variables** tab → note `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`.
3. Click **Data** tab → **Query** → paste the contents of `database/schema.sql`, run it. Then paste `database/seed.sql`, run it.
   (Alternative: use the "Connect" command Railway shows you with the `mysql` CLI from your terminal.)

## 3. Backend — Railway
1. In the same Railway project → **New** → **GitHub Repo** → select your repo → set **Root Directory** to `backend`.
2. Go to the new service's **Variables** tab and add:
   - `DB_HOST` = (MYSQLHOST from step 2)
   - `DB_USER` = (MYSQLUSER)
   - `DB_PASSWORD` = (MYSQLPASSWORD)
   - `DB_NAME` = (MYSQLDATABASE)
   - `JWT_SECRET` = any long random string (e.g. generate with `openssl rand -hex 32`)
   - `PORT` = `5000`
3. **Settings** tab → **Networking** → **Generate Domain**. This gives you a public URL like `https://your-app.up.railway.app`.
4. Wait for the deploy to finish (Deployments tab → logs). Visit `https://your-app.up.railway.app/` — you should see `{"status":"ok",...}`.
5. Test `https://your-app.up.railway.app/api/tickets` — should return `{"error":"No token provided"}` (401), which confirms the server and DB connection both work.

## 4. Frontend — Vercel
1. Go to vercel.com → sign in with GitHub → **Add New Project** → select your repo.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://your-app.up.railway.app/api` (your backend URL from step 3, with `/api` appended)
4. Click **Deploy**. Vercel builds and gives you a public URL like `https://your-app.vercel.app`.

## 5. Verify end-to-end
Open your Vercel URL in an incognito window:
- Register a new customer → log in → create a ticket
- Log out → log in as `agent@example.com` / `password123` → see the ticket → update its status → add a comment
- Log back in as the customer → confirm the status update and comment appear

If the frontend loads but API calls fail, open browser dev tools (F12) → Console/Network tab — it's almost always a wrong `REACT_APP_API_URL` or CORS issue (this backend already has `cors()` enabled for all origins, so it should just work).

## 6. Update your README
Fill in the live frontend and backend URLs at the top of `README.md`, commit, and push.

## 7. Record your Loom
Walk through: the live app (customer + agent flows), your code structure, the Postman collection running a few requests, and `npm test` passing in the backend.

## 8. Submit the form
- GitHub repo URL (public)
- Deployment (frontend) URL (public)
- Loom link(s)
