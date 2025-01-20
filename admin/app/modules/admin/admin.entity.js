import { DataTypes } from "sequelize";
import { dbConfig } from "../../../db.config.js";

export const AdminModel = dbConfig.define(
  "admin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    role: {
      type: DataTypes.ENUM("admin", "superadmin"),
      defaultValue: "admin",
    },
  },
  { timestamps: false }
);
