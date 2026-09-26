const assertTicketAccess = (req, ticket) => {
    if (
        req.user.role === "customer" &&
        Number(ticket.user_id) !== Number(req.user.id)
    ) {
        const error = new Error("You are not allowed to access this ticket");
        error.statusCode = 403;
        throw error;
    }
};

module.exports = assertTicketAccess;
