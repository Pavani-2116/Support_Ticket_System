const db = require("../config/db");

const getUsers = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY id`
        );

        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getAgents = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, name, email
             FROM users
             WHERE role = 'agent'
             ORDER BY name`
        );

        res.json(rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getAgents
};