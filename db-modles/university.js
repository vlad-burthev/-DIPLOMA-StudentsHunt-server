import { DataTypes } from "sequelize";
import { dbConfig } from "../../../db.config.js";

export const UniversityModel = dbConfig.define(
  "university",
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      required: true,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      required: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      required: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      required: true,
    },
    password: {
      type: DataTypes.STRING,
      required: true,
    },
    city: {
      type: DataTypes.STRING,
      required: true,
    },
    avatar: {
      type: DataTypes.STRING,
      unique: true,
      default: "",
    },
    role: {
      type: DataTypes.STRING,
      required: true,
      default: ROLES.university,
    },
    about: {
      type: DataTypes.STRING,
      default: "",
    },
    site: {
      type: DataTypes.STRING,
      unique: true,
      default: "",
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      required: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      default: false,
    },

    isActivated: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
    activationLink: {
      type: DataTypes.STRING,
      default: "",
    },
    edrpou: {},
  },
  { timestamps: true }
);
