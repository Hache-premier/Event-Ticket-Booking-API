import { query } from "../db.js";

export const findBookingById = async (id) => {
  const result = await query("SELECT * FROM bookings WHERE id = $1", [id]);

  return result.rows[0] ?? null;
};

export const findBookingsByEventId = async (
  eventId,
  { afterBookedAt = null, afterId = null, limit = 20 } = {},
) => {
  const result = await query(
    `SELECT *
    FROM bookings
    WHERE event_id = $1
      AND (
        $2::timestamptz IS NULL
        OR (booked_at, id) < ($2::timestamptz, $3::bigint)
      )
    ORDER BY booked_at DESC, id DESC
    LIMIT $4`,
    [eventId, afterBookedAt, afterId, limit],
  );

  return result.rows;
};

export const findBookingsByCustomerId = async (
  customerId,
  { afterBookedAt = null, afterId = null, limit = 20 } = {},
) => {
  const result = await query(
    `SELECT *
    FROM bookings
    WHERE customer_id = $1
      AND (
        $2::timestamptz IS NULL
        OR (booked_at, id) < ($2::timestamptz, $3::bigint)
      )
    ORDER BY booked_at DESC, id DESC
    LIMIT $4`,
    [customerId, afterBookedAt, afterId, limit],
  );

  return result.rows;
};

export const reserveEventSeats = async (client, eventId, quantity) => {
  const result = await client.query(
    `UPDATE events
    SET
      seats_remaining = seats_remaining - $1,
      status = CASE
        WHEN seats_remaining - $1 = 0 THEN 'sold_out'
        ELSE 'on_sale'
      END
    WHERE id = $2
      AND status = 'on_sale'
      AND seats_remaining >= $1
    RETURNING *`,
    [quantity, eventId],
  );

  return result.rows[0] ?? null;
};

export const findEventForBooking = async (client, eventId) => {
  const result = await client.query("SELECT * FROM events WHERE id = $1", [
    eventId,
  ]);

  return result.rows[0] ?? null;
};

export const createBooking = async (
  client,
  { eventId, customerId, quantity },
) => {
  const result = await client.query(
    `INSERT INTO bookings (event_id, customer_id, quantity)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [eventId, customerId, quantity],
  );

  return result.rows[0];
};
