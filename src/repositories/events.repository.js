import { query } from "../db.js";

export const createEvent = async ({ name, venue, starts_at, capacity }) => {
  const result = await query(
    `INSERT INTO events (
      name,
      venue,
      starts_at,
      capacity,
      seats_remaining,
      status
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $4,
      CASE WHEN $4 = 0 THEN 'sold_out' ELSE 'on_sale' END
    )
    RETURNING *`,
    [name, venue, starts_at, capacity],
  );

  return result.rows[0];
};

export const findEventById = async (id) => {
  const result = await query("SELECT * FROM events WHERE id = $1", [id]);

  return result.rows[0] ?? null;
};

export const findEvents = async ({
  afterStartsAt = null,
  afterId = null,
  limit = 20,
} = {}) => {
  const result = await query(
    `SELECT *
    FROM events
    WHERE (
      $1::timestamptz IS NULL
      OR (starts_at, id) > ($1::timestamptz, $2::bigint)
    )
    ORDER BY starts_at ASC, id ASC
    LIMIT $3`,
    [afterStartsAt, afterId, limit],
  );

  return result.rows;
};
