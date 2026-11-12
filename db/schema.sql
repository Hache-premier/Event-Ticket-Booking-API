CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  venue VARCHAR(150) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  seats_remaining INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'on_sale',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT events_seats_remaining_check
    CHECK (seats_remaining >= 0 AND seats_remaining <= capacity),

  CONSTRAINT events_status_check
    CHECK (
      (status = 'on_sale' AND seats_remaining > 0)
      OR (status = 'sold_out' AND seats_remaining = 0)
      OR status = 'cancelled'
    ),

  CONSTRAINT events_status_value_check
    CHECK (status IN ('on_sale', 'sold_out', 'cancelled'))
);

CREATE TABLE customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT customers_full_name_check
    CHECK (LENGTH(BTRIM(full_name)) > 0),

  CONSTRAINT customers_email_check
    CHECK (LENGTH(BTRIM(email)) > 0)
);

CREATE UNIQUE INDEX customers_email_unique_idx
  ON customers (LOWER(BTRIM(email)));

CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  CONSTRAINT bookings_status_check
    CHECK (status IN ('confirmed', 'cancelled')),

  CONSTRAINT bookings_cancellation_check
    CHECK (
      (status = 'confirmed' AND cancelled_at IS NULL)
      OR (status = 'cancelled' AND cancelled_at IS NOT NULL)
    )
);

CREATE INDEX events_starts_at_id_idx
  ON events (starts_at, id);

CREATE INDEX bookings_event_booked_at_id_idx
  ON bookings (event_id, booked_at DESC, id DESC);

CREATE INDEX bookings_customer_id_idx
  ON bookings (customer_id);
