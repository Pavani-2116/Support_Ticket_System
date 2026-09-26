const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouters = require("./routes/authRouters");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const commentRoutes = require("./routes/commentRoutes");
const errorMiddleware = require("./middleware/errorMiddleWare");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "Support Ticket API",
        status: "ok"
    });
});

app.get("/test-db", async (req, res, next) => {
    try {
        const db = require("./config/db");
        const [rows] = await db.execute("SELECT 1 AS result");
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

app.use("/api/auth", authRouters);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets", commentRoutes);

app.use(errorMiddleware);

module.exports = app;
