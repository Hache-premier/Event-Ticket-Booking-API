import { pool } from "../db.js";
import {
  createBooking,
  findEventForBooking,
  reserveEventSeats,
} from "../repositories/bookings.repository.js";
import { findCustomerByIdWithClient } from "../repositories/customers.repository.js";

export class BookingError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = "BookingError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const createBookingService = async ({
  eventId,
  customerId,
  quantity,
}) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Step 1: Make sure the customer exists.
    const customer = await findCustomerByIdWithClient(client, customerId);

    if (!customer) {
      throw new BookingError("Customer not found.", 400, "CUSTOMER_NOT_FOUND");
    }

    // Step 2: Reserve the requested seats atomically.
    const event = await reserveEventSeats(client, eventId, quantity);

    if (!event) {
      // Find out why the reservation failed.
      const existingEvent = await findEventForBooking(client, eventId);

      if (!existingEvent) {
        throw new BookingError("Event not found.", 404, "EVENT_NOT_FOUND");
      }

      if (existingEvent.status === "cancelled") {
        throw new BookingError(
          "This event has been cancelled.",
          409,
          "EVENT_CANCELLED",
        );
      }

      throw new BookingError(
        "Not enough seats are available.",
        409,
        "INSUFFICIENT_SEATS",
      );
    }

    // Step 3: Create the booking record.
    const booking = await createBooking(client, {
      eventId,
      customerId,
      quantity,
    });

    // Step 4: Save both database changes together.
    await client.query("COMMIT");
    transactionStarted = false;

    return booking;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Booking transaction rollback failed:", rollbackError);
      }
    }

    throw error;
  } finally {
    // Always return the connection to the pool.
    client.release();
  }
};
