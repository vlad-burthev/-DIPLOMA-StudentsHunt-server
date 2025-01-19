import { configDotenv } from "dotenv";
import { Sequelize } from "sequelize";

configDotenv();

export const dbConfig = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  }
);

// export const dbConfig = new Sequelize(process.env.DB_URL, {
//   dialect: "postgres",
//   logging: console.log,
// });
