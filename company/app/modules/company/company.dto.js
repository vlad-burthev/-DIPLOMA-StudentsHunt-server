import { check } from "express-validator";
import { publicEmailDomains } from "../../../../commom/publicMails.js";

const validateCorporateEmail = (value) => {
  const parts = value.split("@");
  if (parts.length !== 2) {
    throw new Error("Некоректний email");
  }
  const domain = parts[1].toLowerCase();
  if (publicEmailDomains.includes(domain)) {
    throw new Error("Email повинен бути корпоративним");
  }
  return true;
};

export const createCompanyValidator = [
  check("title")
    .isLength({ min: 4, max: 254 })
    .withMessage("Title должен быть длиной от 4 до 254 символов"),
  check("phone")
    .matches(/^\+380\d{9}$/)
    .withMessage("Phone должен соответствовать формату +380123456789"),
  check("egrpou")
    .matches(/^\d{8}$/)
    .withMessage("ЄДРПОУ должен содержать ровно 8 цифр"),
  check("description")
    .isLength({ min: 26, max: 999 })
    .withMessage("Description должен быть длиной от 26 до 999 символов"),
  check("email")
    .isEmail()
    .withMessage("Некорректный формат email")
    .custom(validateCorporateEmail),
  check("password")
    .isLength({ min: 7 })
    .withMessage("Password должен быть более 6 символов"),
];
