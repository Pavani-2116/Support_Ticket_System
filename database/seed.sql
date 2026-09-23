USE support_tickets;

-- password for both accounts below is: password123
INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Customer', 'customer@example.com', '$2b$10$EBvMbbo.LhoTM7bOcHGZ/egJOj9YFFmEp1Ob6WIuUVwnl3VXffCjG', 'customer'),
('Bob Agent', 'agent@example.com', '$2b$10$EBvMbbo.LhoTM7bOcHGZ/egJOj9YFFmEp1Ob6WIuUVwnl3VXffCjG', 'agent');

INSERT INTO tickets (user_id, subject, description, priority, status) VALUES
(1, 'Cannot log into my account', 'I keep getting an invalid credentials error even though I am sure the password is right.', 'high', 'open'),
(1, 'Billing question', 'Why was I charged twice this month?', 'medium', 'open');

INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES
(1, 1, 'This started happening after I changed my password yesterday.');
