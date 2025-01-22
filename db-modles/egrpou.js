import { DataTypes } from "sequelize";
import { dbConfig } from "../../../db.config.js";

export const EgrpouModel = dbConfig.define(
  "egrpou",
  {
    customerId: { type: DataTypes.UUID, required: true, unique: true },
    egrpou: { type: DataTypes.STRING, required: true },
    name: { type: DataTypes.STRING, required: true },
    name_short: { type: DataTypes.STRING, default: "" },
    address: { type: DataTypes.STRING, default: "" },
    director: { type: DataTypes.STRING, default: "" },
    kved: { type: DataTypes.STRING, default: "" },
    inn: { type: DataTypes.STRING, default: "" },
    inn_date: { type: DataTypes.STRING, default: "" },
  },
  { timestamps: true }
);
