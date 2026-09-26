const db = require("../config/db");
const assertTicketAccess = require("../utils/ticketAccess");

const TICKET_SELECT = `
    SELECT
        tickets.id,
        tickets.subject,
        tickets.description,
        tickets.status,
        tickets.priority,
        tickets.user_id,
        tickets.assigned_to,
        tickets.created_at,
        tickets.updated_at,
        users.name AS user_name,
        users.email AS user_email,
        agent.name AS assigned_to_name
    FROM tickets
    JOIN users
        ON tickets.user_id = users.id
    LEFT JOIN users agent
        ON tickets.assigned_to = agent.id
`;

const SORT_COLUMNS = {
    created_at: "tickets.created_at",
    updated_at: "tickets.updated_at",
    status: "tickets.status",
    priority: "tickets.priority",
    subject: "tickets.subject"
};

const VALID_STATUS = ["open", "in_progress", "resolved", "closed"];
const VALID_PRIORITY = ["low", "medium", "high"];

const createTicket = async (req, res, next) => {
    try {
        const subject = (req.body.subject || "").trim();
        const description = (req.body.description || "").trim();
        const priority = req.body.priority || "medium";

        if (!subject || !description) {
            return res.status(400).json({
                message: "Subject and description are required"
            });
        }

        if (!VALID_PRIORITY.includes(priority)) {
            return res.status(400).json({
                message: "Priority must be low, medium or high"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO tickets
            (user_id, subject, description, priority)
            VALUES (?, ?, ?, ?)`,
            [req.user.id, subject, description, priority]
        );

        res.status(201).json({
            message: "Ticket created",
            ticketId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

const getTickets = async (req, res, next) => {
    try {
        const { search, status, priority, sort = "created_at", order = "desc" } = req.query;
        const clauses = [];
        const values = [];

        if (req.user.role !== "agent") {
            clauses.push("tickets.user_id = ?");
            values.push(req.user.id);
        }

        if (search) {
            clauses.push("(tickets.subject LIKE ? OR tickets.description LIKE ?)");
            const term = `%${search}%`;
            values.push(term, term);
        }

        if (status) {
            if (!VALID_STATUS.includes(status)) {
                return res.status(400).json({ message: "Invalid status filter" });
            }
            clauses.push("tickets.status = ?");
            values.push(status);
        }

        if (priority) {
            if (!VALID_PRIORITY.includes(priority)) {
                return res.status(400).json({ message: "Invalid priority filter" });
            }
            clauses.push("tickets.priority = ?");
            values.push(priority);
        }

        const sortColumn = SORT_COLUMNS[sort] || SORT_COLUMNS.created_at;
        const sortOrder = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";
        const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

        const [rows] = await db.execute(
            `${TICKET_SELECT}
             ${whereSql}
             ORDER BY ${sortColumn} ${sortOrder}`,
            values
        );

        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getTicketStats = async (req, res, next) => {
    try {
        const [byStatus] = await db.execute(
            `SELECT status, COUNT(*) AS count
             FROM tickets
             GROUP BY status`
        );

        const [byPriority] = await db.execute(
            `SELECT priority, COUNT(*) AS count
             FROM tickets
             GROUP BY priority`
        );

        const [totals] = await db.execute(
            `SELECT
                COUNT(*) AS total,
                SUM(assigned_to IS NULL) AS unassigned
             FROM tickets`
        );

        res.json({
            total: Number(totals[0].total) || 0,
            unassigned: Number(totals[0].unassigned) || 0,
            byStatus,
            byPriority
        });
    } catch (error) {
        next(error);
    }
};

const getTicketById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `${TICKET_SELECT}
             WHERE tickets.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        try {
            assertTicketAccess(req, rows[0]);
        } catch (accessError) {
            return res.status(accessError.statusCode).json({
                message: accessError.message
            });
        }

        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, priority, assigned_to } = req.body;

        const [existing] = await db.execute(
            "SELECT id, status, priority, assigned_to FROM tickets WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const nextStatus = status ?? existing[0].status;
        const nextPriority = priority ?? existing[0].priority;
        const nextAssignee =
            assigned_to === undefined ? existing[0].assigned_to : assigned_to;

        if (!VALID_STATUS.includes(nextStatus)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (!VALID_PRIORITY.includes(nextPriority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        if (nextAssignee !== null && nextAssignee !== undefined) {
            const [agents] = await db.execute(
                `SELECT id
                 FROM users
                 WHERE id = ?
                 AND role = 'agent'`,
                [nextAssignee]
            );

            if (agents.length === 0) {
                return res.status(400).json({
                    message: "assigned_to must be a valid agent"
                });
            }
        }

        await db.execute(
            `UPDATE tickets
             SET status = ?,
                 priority = ?,
                 assigned_to = ?
             WHERE id = ?`,
            [nextStatus, nextPriority, nextAssignee || null, id]
        );

        res.json({
            message: "Ticket updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM tickets WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        res.json({
            message: "Ticket deleted"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    getTicketStats,
    updateTicket,
    deleteTicket
};
