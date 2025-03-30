import { check } from "express-validator";

export const signInValidator = [
  check("email").isEmail().withMessage("Некоректний формат email"),
  check("password")
    .isLength({ min: 7 })
    .withMessage("Пароль повинен містити більше 5 символів"),
];
