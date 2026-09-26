const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const db = require("../config/db");

describe("Auth", () => {
    const testEmail = `authtest.${Date.now()}@example.com`;
    const testPassword = "Password123!";

    beforeAll(async () => {
        const passwordHash = await bcrypt.hash(testPassword, 10);

        await db.execute(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'customer')`,
            ["Auth Test Customer", testEmail, passwordHash]
        );
    });

    afterAll(async () => {
        await db.execute(
            "DELETE FROM users WHERE email = ?",
            [testEmail]
        );

        await db.end();
    });

    test("rejects login with an invalid password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "wrongpassword"
            });

        expect(res.statusCode).toBe(401);
    });

    test("logs in successfully with correct credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: testPassword
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    test("rejects registration missing required fields", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                email: "x@x.com"
            });

        expect(res.statusCode).toBe(400);
    });
});