import pkg from "pg";

import { configDotenv } from "dotenv";

configDotenv();

const client = new pkg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default client;
