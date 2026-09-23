# Support Ticket Management System

A full-stack support ticket system with customer and agent roles, JWT authentication, and role-based authorization.

**Live App:** _add your deployed frontend URL here_
**Live API:** _add your deployed backend URL here_

## Tech Stack
- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: MySQL
- Auth: JWT + bcrypt
- Testing: Jest + Supertest
- API testing: Postman

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Customer | customer@example.com | password123 |
| Agent | agent@example.com | password123 |

## Project Structure
```
support-ticket-system/
├── backend/          Express REST API
├── frontend/         React app
├── database/         schema.sql and seed.sql
├── postman/          Postman collection
└── README.md
```

## Local Setup

### 1. Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your DB password and a JWT secret
npm run dev             # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL if not localhost
npm start                # starts on http://localhost:3000
```

## Running Tests
```bash
cd backend
npm test
```
8 tests covering: valid/invalid login, missing fields on register, unauthenticated access (401), ticket creation, agent status updates, customer forbidden from agent-only routes (403), and non-existent ticket (404).

## API Testing
Import `postman/postman_collection.json` into Postman. Set the `baseUrl` variable to your API URL, run "Login" requests first and copy the returned token into the `token` / `customerToken` collection variables.

## Example JOIN Query
```sql
SELECT t.id, t.subject, t.status, u.name AS customer_name, u.email
FROM tickets t
JOIN users u ON t.user_id = u.id
WHERE t.status = 'open';
```
(Implemented in `backend/routes/tickets.js` in the agent's `GET /api/tickets`.)

## Security Notes
- Passwords hashed with bcrypt (cost factor 10), never stored in plain text
- JWT-based auth with a separate `requireRole` authorization layer (401 vs 403)
- All SQL uses parameterized queries (`?` placeholders) — no string concatenation
- Customers can only view/comment on their own tickets (enforced server-side, not just hidden in the UI)
- Secrets loaded from `.env`, never committed (see `.gitignore`)

## Deployment
- **Database:** hosted on Railway/Aiven MySQL
- **Backend:** hosted on Railway/Render, env vars set in the platform dashboard
- **Frontend:** hosted on Vercel/Netlify, `REACT_APP_API_URL` pointed at the live backend

See `DEPLOYMENT.md` for exact step-by-step deployment instructions.
