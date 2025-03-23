import pkg from "pg";

const client = new pkg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export const getUserFromAllTables = async (email) => {
  const findUserQuery = `
        SELECT EXISTS (
        SELECT user FROM recruiters WHERE email = $1
        UNION ALL
        SELECT user FROM companies WHERE email = $1
      ) RETURNING *;
    `;

  const { rows } = client.query(findUserQuery, [email]);

  if (!rows[0]) {
    throw Error("user not found");
  }

  return rows[0];
};
