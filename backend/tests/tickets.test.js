const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const db = require("../config/db");

describe("Tickets", () => {
    let customerToken;
    let agentToken;
    let ticketId;
    let agentUserId;

    const customerEmail = `ticketcustomer.${Date.now()}@example.com`;
    const agentEmail = `ticketagent.${Date.now()}@example.com`;
    const password = "Password123!";

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash(password, 10);

        const [customerResult] = await db.execute(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'customer')`,
            ["Ticket Test Customer", customerEmail, passwordHash]
        );

        const [agentResult] = await db.execute(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'agent')`,
            ["Ticket Test Agent", agentEmail, passwordHash]
        );

        agentUserId = agentResult.insertId;

        const customerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: customerEmail,
                password
            });

        customerToken = customerLogin.body.token;

        const agentLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: agentEmail,
                password
            });

        agentToken = agentLogin.body.token;
    });

    afterAll(async () => {
        if (ticketId) {
            await db.execute(
                "DELETE FROM tickets WHERE id = ?",
                [ticketId]
            );
        }

        await db.execute(
            "DELETE FROM users WHERE email IN (?, ?)",
            [customerEmail, agentEmail]
        );

        await db.end();
    });

    test("rejects unauthenticated access to /api/tickets", async () => {
        const res = await request(app)
            .get("/api/tickets");

        expect(res.statusCode).toBe(401);
    });

    test("allows a customer to create a ticket", async () => {
        const res = await request(app)
            .post("/api/tickets")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                subject: "Test ticket",
                description: "Something is broken",
                priority: "low"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.ticketId).toBeDefined();

        ticketId = res.body.ticketId;
    });

    test("allows an agent to update ticket status", async () => {
        const res = await request(app)
            .put(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                status: "in_progress",
                assigned_to: agentUserId
            });

        expect(res.statusCode).toBe(200);
    });

    test("forbids a customer from updating ticket status", async () => {
        const res = await request(app)
            .put(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                status: "closed"
            });

        expect(res.statusCode).toBe(403);
    });

    test("returns 404 for a non-existent ticket", async () => {
        const res = await request(app)
            .get("/api/tickets/999999")
            .set("Authorization", `Bearer ${agentToken}`);

        expect(res.statusCode).toBe(404);
    });
});