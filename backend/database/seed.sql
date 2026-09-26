USE support_ticket_db;

-- Seed passwords are Password123! (bcrypt hashed, never stored in plain text)
INSERT INTO users (name, email, password_hash, role)
VALUES
('Agent One', 'agent@example.com', '$2b$10$y3FCZqJhiLiy1LAnTHOWF.0t3OS.BkzC5OW9/aIJbHjG54hjvijMK', 'agent'),
('Agent Two', 'agent2@example.com', '$2b$10$y3FCZqJhiLiy1LAnTHOWF.0t3OS.BkzC5OW9/aIJbHjG54hjvijMK', 'agent'),
('Customer One', 'customer@example.com', '$2b$10$y3FCZqJhiLiy1LAnTHOWF.0t3OS.BkzC5OW9/aIJbHjG54hjvijMK', 'customer')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role);

INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
SELECT
    c.id,
    'Cannot reset account password',
    'The reset email never arrives when I use the forgot-password form.',
    'high',
    'open',
    a.id
FROM users c
JOIN users a ON a.email = 'agent@example.com'
WHERE c.email = 'customer@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets t WHERE t.subject = 'Cannot reset account password'
  );

INSERT INTO tickets (user_id, subject, description, priority, status)
SELECT
    c.id,
    'Invoice PDF is blank',
    'Last month''s invoice downloads as an empty PDF.',
    'medium',
    'in_progress'
FROM users c
WHERE c.email = 'customer@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM tickets t WHERE t.subject = 'Invoice PDF is blank'
  );

INSERT INTO ticket_comments (ticket_id, user_id, comment)
SELECT t.id, a.id, 'Looking into the mail provider logs now.'
FROM tickets t
JOIN users a ON a.email = 'agent@example.com'
WHERE t.subject = 'Cannot reset account password'
  AND NOT EXISTS (
      SELECT 1 FROM ticket_comments c WHERE c.ticket_id = t.id
  );
