const bcrypt = require("bcrypt");
const db = require("../config/db");
const generateToken = require("../utils/generateTokens");

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res, next) => {
    try {
        const name = (req.body.name || "").trim();
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, 'customer')`,
            [name, email, passwordHash]
        );

        res.status(201).json({
            message: "Registration successful"
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [rows] = await db.execute(
            `SELECT id, name, email, password_hash, role
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (rows.length === 0 || !rows[0].password_hash) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = rows[0];
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken({
            id: user.id,
            role: user.role
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};
