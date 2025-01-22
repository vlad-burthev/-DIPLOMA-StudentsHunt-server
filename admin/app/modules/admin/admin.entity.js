import { DataTypes } from "sequelize";
import { dbConfig } from "../../../db.config.js";

export const AdminModel = dbConfig.define(
  "admin",
  {
    id: { type: DataTypes.UUID, primaryKey: true, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    role: { type: DataTypes.STRING, defaultValue: "ADMIN" },
  },
  { timestamps: false }
);
