const db = require("../config/db");
const assertTicketAccess = require("../utils/ticketAccess");

const loadTicket = async (id) => {
    const [rows] = await db.execute(
        "SELECT id, user_id FROM tickets WHERE id = ?",
        [id]
    );
    return rows[0] || null;
};

const getComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await loadTicket(id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        try {
            assertTicketAccess(req, ticket);
        } catch (accessError) {
            return res.status(accessError.statusCode).json({
                message: accessError.message
            });
        }

        const [rows] = await db.execute(
            `SELECT
                c.id,
                c.ticket_id,
                c.user_id,
                c.comment,
                c.created_at,
                u.name AS user_name,
                u.role
             FROM ticket_comments c
             JOIN users u
                ON c.user_id = u.id
             WHERE c.ticket_id = ?
             ORDER BY c.created_at`,
            [id]
        );

        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const createComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comment = (req.body.comment || "").trim();

        if (!comment) {
            return res.status(400).json({
                message: "Comment is required"
            });
        }

        const ticket = await loadTicket(id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        try {
            assertTicketAccess(req, ticket);
        } catch (accessError) {
            return res.status(accessError.statusCode).json({
                message: accessError.message
            });
        }

        const [result] = await db.execute(
            `INSERT INTO ticket_comments
            (ticket_id, user_id, comment)
            VALUES (?, ?, ?)`,
            [id, req.user.id, comment]
        );

        res.status(201).json({
            message: "Comment added",
            commentId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getComments,
    createComment
};
