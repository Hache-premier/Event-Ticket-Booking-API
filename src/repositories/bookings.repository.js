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
