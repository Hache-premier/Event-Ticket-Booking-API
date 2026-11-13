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
