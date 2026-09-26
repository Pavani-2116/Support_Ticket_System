const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const db = require("../config/db");

const uniqueEmail = (prefix) =>
    `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;

describe("Support Ticket API", () => {
    let customerToken;
    let otherCustomerToken;
    let agentToken;
    let customerTicketId;
    let agentUserId;

    beforeAll(async () => {
        const agentEmail = uniqueEmail("agent");
        const passwordHash = await bcrypt.hash("Password123!", 10);

        const [agentResult] = await db.execute(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'agent')`,
            ["Test Agent", agentEmail, passwordHash]
        );
        agentUserId = agentResult.insertId;

        const agentLogin = await request(app).post("/api/auth/login").send({
            email: agentEmail,
            password: "Password123!"
        });
        agentToken = agentLogin.body.token;
    });

    afterAll(async () => {
        await db.end();
    });

    test("valid registration succeeds", async () => {
        const email = uniqueEmail("customer");
        const res = await request(app).post("/api/auth/register").send({
            name: "Customer A",
            email,
            password: "Password123!"
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/successful/i);

        const login = await request(app).post("/api/auth/login").send({
            email,
            password: "Password123!"
        });
        expect(login.status).toBe(200);
        customerToken = login.body.token;
        expect(customerToken).toBeTruthy();
    });

    test("invalid password is rejected", async () => {
        const email = uniqueEmail("badlogin");
        await request(app).post("/api/auth/register").send({
            name: "Bad Login",
            email,
            password: "Password123!"
        });

        const res = await request(app).post("/api/auth/login").send({
            email,
            password: "wrong-password"
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid/i);
    });

    test("invalid input is rejected on register", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "No Password",
            email: "not-an-email"
        });

        expect(res.status).toBe(400);
    });

    test("unauthorized request is rejected", async () => {
        const res = await request(app).get("/api/tickets");
        expect(res.status).toBe(401);
    });

    test("ticket creation succeeds for a customer", async () => {
        const res = await request(app)
            .post("/api/tickets")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                subject: "Printer is offline",
                description: "Office printer shows a red error light.",
                priority: "high"
            });

        expect(res.status).toBe(201);
        expect(res.body.ticketId).toBeDefined();
        customerTicketId = res.body.ticketId;
    });

    test("customer can list their tickets", async () => {
        const res = await request(app)
            .get("/api/tickets")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((ticket) => ticket.id === customerTicketId)).toBe(true);
    });

    test("invalid ticket ID returns not found", async () => {
        const res = await request(app)
            .get("/api/tickets/999999")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(res.status).toBe(404);
    });

    test("customer cannot access another customer's ticket", async () => {
        const email = uniqueEmail("other");
        await request(app).post("/api/auth/register").send({
            name: "Customer B",
            email,
            password: "Password123!"
        });

        const login = await request(app).post("/api/auth/login").send({
            email,
            password: "Password123!"
        });
        otherCustomerToken = login.body.token;

        const res = await request(app)
            .get(`/api/tickets/${customerTicketId}`)
            .set("Authorization", `Bearer ${otherCustomerToken}`);

        expect(res.status).toBe(403);
    });

    test("forbidden request for an incorrect role", async () => {
        const res = await request(app)
            .put(`/api/tickets/${customerTicketId}`)
            .set("Authorization", `Bearer ${customerToken}`)
            .send({ status: "closed" });

        expect(res.status).toBe(403);
    });

    test("agent can update ticket status", async () => {
        const res = await request(app)
            .put(`/api/tickets/${customerTicketId}`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                status: "in_progress",
                assigned_to: agentUserId
            });

        expect(res.status).toBe(200);

        const details = await request(app)
            .get(`/api/tickets/${customerTicketId}`)
            .set("Authorization", `Bearer ${agentToken}`);

        expect(details.body.status).toBe("in_progress");
        expect(details.body.assigned_to).toBe(agentUserId);
    });
});
