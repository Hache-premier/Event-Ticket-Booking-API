INSERT INTO customers (full_name, email)
SELECT 'Alex Johnson', 'alex@example.com'
WHERE NOT EXISTS (
  SELECT 1
  FROM customers
  WHERE LOWER(BTRIM(email)) = LOWER('alex@example.com')
);

INSERT INTO customers (full_name, email)
SELECT 'Sarah Williams', 'sarah@example.com'
WHERE NOT EXISTS (
  SELECT 1
  FROM customers
  WHERE LOWER(BTRIM(email)) = LOWER('sarah@example.com')
);

INSERT INTO events (
  name,
  venue,
  starts_at,
  capacity,
  seats_remaining,
  status
)
SELECT
  'Tech Innovation Summit',
  'Yaounde Conference Centre',
  '2027-02-15 09:00:00+01',
  100,
  100,
  'on_sale'
WHERE NOT EXISTS (
  SELECT 1
  FROM events
  WHERE name = 'Tech Innovation Summit'
    AND venue = 'Yaounde Conference Centre'
);

INSERT INTO events (
  name,
  venue,
  starts_at,
  capacity,
  seats_remaining,
  status
)
SELECT
  'Future Developers Conference',
  'Douala Grand Mall',
  '2027-03-20 10:00:00+01',
  50,
  50,
  'on_sale'
WHERE NOT EXISTS (
  SELECT 1
  FROM events
  WHERE name = 'Future Developers Conference'
    AND venue = 'Douala Grand Mall'
);
