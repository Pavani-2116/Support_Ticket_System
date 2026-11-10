# Support Ticket Management System

A full-stack web application that allows customers to create and track support tickets while enabling support agents to manage, assign, update, and respond to customer requests.

## Project Overview

The Support Ticket Management System provides a centralized platform for handling customer support requests. It includes role-based access for customers and agents, secure authentication, ticket management, and communication through comments.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT, bcrypt |
| API | REST APIs |
| Testing | Postman, Backend Tests |

## Key Features

- Customer registration and login
- Secure authentication using JWT and bcrypt
- Role-based access for customers and agents
- Create, view, and track support tickets
- Agents can manage and update tickets
- Assign and respond to customer requests
- Ticket comments and communication
- Agent dashboard with ticket statistics
- MySQL database integration

## Repository

**GitHub:** https://github.com/Pavani-2116/Support_Ticket_System

**Frontend Live Demo:** Not deployed yet

## Demo Accounts

After executing `database/schema.sql` and `database/seed.sql`, use the following accounts:

| Role | Email | Password |
|---|---|---|
| Agent | agent@example.com | Password123! |
| Agent | agent2@example.com | Password123! |
| Customer | customer@example.com | Password123! |

*These are development demo credentials. Do not use real or sensitive information.*

## Project Structure

```text
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

## Installation and Setup

### Prerequisites

- Node.js and npm
- MySQL 8.0
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Pavani-2116/Support_Ticket_System.git
cd Support_Ticket_System
```

### 2. Database Setup

Start MySQL and execute the SQL files using MySQL Workbench or the MySQL command-line client.

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### 3. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

Update the `.env` file with your database credentials and configuration:

```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend API:

```text
http://localhost:3002
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Optionally, create a `.env` file:

```env
VITE_API_URL=http://localhost:3002
```

Start the frontend:

```bash
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

## API Documentation

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/tickets` | Authenticated |
| POST | `/api/tickets` | Customer |
| GET | `/api/tickets/stats` | Agent |
| GET | `/api/tickets/:id` | Owner or Agent |
| PUT | `/api/tickets/:id` | Agent |
| DELETE | `/api/tickets/:id` | Agent |
| GET | `/api/tickets/:id/comments` | Owner or Agent |
| POST | `/api/tickets/:id/comments` | Owner or Agent |
| GET | `/api/users` | Agent |
| GET | `/api/users/agents` | Agent |

## SQL JOIN Example

The following query retrieves open tickets along with customer information.

```sql
SELECT
    tickets.id,
    tickets.subject,
    tickets.status,
    users.name,
    users.email
FROM tickets
JOIN users ON tickets.user_id = users.id
WHERE tickets.status = 'open';
```

This query is also available in `database/queries.sql`.

## Testing

To run backend tests:

```bash
cd backend
npm test
```

**Postman Collection:**

`postman/Support-Ticket-API.postman_collection.json`

## Deployment

The application can be deployed using the following services:

| Component | Suggested Platforms |
|---|---|
| Frontend | Netlify, Cloudflare Pages |
| Backend | Render, Railway |
| Database | Aiven, Railway, PlanetScale |

Deployment steps:

1. Provision a MySQL database.
2. Execute the database schema and seed files.
3. Deploy the backend and configure environment variables.
4. Set `FRONTEND_URL` to the deployed frontend URL.
5. Deploy the frontend with `VITE_API_URL` pointing to the backend API.
6. Verify API connectivity, CORS configuration, and authentication.

**Security Note:** Never commit `.env` files, database passwords, JWT secrets, or other sensitive credentials to GitHub.

## Learning Outcomes

- Developed a full-stack application using React and Node.js.
- Practiced REST API development and integration.
- Implemented JWT authentication and role-based authorization.
- Worked with MySQL database operations and SQL JOIN queries.
- Organized frontend and backend code into separate modules.
- Tested APIs and backend functionality.

## Author

**Pavani Mada**

- GitHub: https://github.com/Pavani-2116
- LinkedIn: https://www.linkedin.com/in/pavani-mada/

---

*Built as a full-stack development project to demonstrate frontend, backend, database, and authentication concepts.*
