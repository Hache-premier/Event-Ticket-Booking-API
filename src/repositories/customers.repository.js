import { query } from "../db.js";

export const findCustomerById = async (id) => {
  const result = await query("SELECT * FROM customers WHERE id = $1", [id]);

  return result.rows[0] ?? null;
};

export const findCustomerByEmail = async (email) => {
  const result = await query(
    "SELECT * FROM customers WHERE LOWER(BTRIM(email)) = LOWER(BTRIM($1))",
    [email],
  );

  return result.rows[0] ?? null;
};

// This version uses the transaction's database client.
export const findCustomerByIdWithClient = async (client, id) => {
  const result = await client.query("SELECT * FROM customers WHERE id = $1", [
    id,
  ]);

  return result.rows[0] ?? null;
};
