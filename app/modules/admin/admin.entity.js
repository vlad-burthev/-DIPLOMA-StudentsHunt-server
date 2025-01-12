import { dbConfig } from "../../../db.config";

export const AdminModel = dbConfig.define("admin", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  role: { type: DataTypes.STRING, defaultValue: "ADMIN" },
});
