-- Required example: all open tickets with the customer's name and email
SELECT
    tickets.id,
    tickets.subject,
    tickets.status,
    tickets.priority,
    users.name AS customer_name,
    users.email AS customer_email
FROM tickets
JOIN users
    ON tickets.user_id = users.id
WHERE tickets.status = 'open'
ORDER BY tickets.created_at DESC;
