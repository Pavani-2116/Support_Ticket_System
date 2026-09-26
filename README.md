# Support Ticket Management System

Web portal for customers to raise support tickets and for agents to triage, assign, and respond.

## Live URLs

- Frontend: _add after deployment_
- Backend API: _add after deployment_
- GitHub: _add after the repository is published_

## Tech stack

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express (existing project, reused)
- Database: MySQL
- Auth: JWT + bcrypt + role-based access

## Demo accounts

After running `database/seed.sql`:

| Role | Email | Password |
| --- | --- | --- |
| Agent | agent@example.com | Password123! |
| Agent | agent2@example.com | Password123! |
| Customer | customer@example.com | Password123! |

## Local setup

### 1. Database

MySQL 8 must be running. Then:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

Or from PowerShell:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\schema.sql
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\seed.sql
```

Example JOIN used by the assessment:

```sql
SELECT tickets.id, tickets.subject, tickets.status, users.name, users.email
FROM tickets
JOIN users ON tickets.user_id = users.id
WHERE tickets.status = 'open';
```

The same query is saved in `database/queries.sql`.

### 2. Backend

```powershell
cd backend
copy .env.example .env
# edit DB_PASSWORD, JWT_SECRET and FRONTEND_URL
npm install
npm run dev
```

API base: `http://localhost:3002`

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

Optional: create `frontend/.env` with `VITE_API_URL=http://localhost:3002`.

## API map

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | /api/auth/register | Public (customers) |
| POST | /api/auth/login | Public |
| GET | /api/tickets | Authenticated (customers see own tickets) |
| POST | /api/tickets | Customer |
| GET | /api/tickets/stats | Agent |
| GET | /api/tickets/:id | Owner or agent |
| PUT | /api/tickets/:id | Agent |
| DELETE | /api/tickets/:id | Agent |
| GET | /api/tickets/:id/comments | Owner or agent |
| POST | /api/tickets/:id/comments | Authenticated owner or agent |
| GET | /api/users | Agent |
| GET | /api/users/agents | Agent |

## Tests

```powershell
cd backend
npm test
```

Postman collection: `postman/Support-Ticket-API.postman_collection.json`

## Deployment notes

1. Provision a MySQL database (PlanetScale, Railway, Aiven, or a cloud VM).
2. Run `database/schema.sql` and `database/seed.sql`.
3. Host the backend (Render, Railway, or Fly.io) with environment variables from `.env.example`.
4. Set `FRONTEND_URL` to the public frontend origin.
5. Host the frontend (Netlify, Cloudflare Pages, or Render static) with `VITE_API_URL` pointing at the public API.
6. Confirm CORS, JWT secret, and DB credentials are set in the host dashboard — never commit them.

Suggested hosts for a student submission: **Render** (API + static site) and **Aiven** or **Railway** (MySQL).

## Project layout

```
support-ticket-system/
├── frontend/
├── backend/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries.sql
├── tests/
├── postman/
├── README.md
├── .env.example
└── docker-compose.yml
```
