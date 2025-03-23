import { check } from "express-validator";
import { publicEmailDomains } from "../../../../common/commonData/publicMails.js";

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
    .withMessage("Назва компанії повинна бути довжиною від 4 до 254 символів"),
  check("phone")
    .matches(/^\+380\d{9}$/)
    .withMessage("Номер тел. повинен відповідати формату +380123456789"),
  check("egrpou")
    .matches(/^\d{8}$/)
    .withMessage("Код ЄДРПОУ повинен містити рівно 8 цифр"),
  check("description")
    .isLength({ min: 26, max: 999 })
    .withMessage("Опис повинен бути довжиною від 26 до 999 символів"),
  check("email")
    .isEmail()
    .withMessage("Некоректний формат email")
    .custom(validateCorporateEmail),
  check("password")
    .isLength({ min: 7 })
    .withMessage("Пароль повинен містити більше 5 символів"),
];
