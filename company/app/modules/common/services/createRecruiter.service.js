import { check, validationResult } from "express-validator";
import {
  ApiError,
  ApiResponse,
} from "../../../../../httpResponse/httpResponse.js";
import client from "../../../../db.config.js";
import CloudinaryService from "../../../../../services/cloudnary.service.js";
import * as bcrypt from "bcrypt";

export const createRecruiterService = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return next(ApiError.BAD_REQUEST("Файл не знайдено"));
    }

    const { rows } = await client.query(
      `
      SELECT EXISTS (
      SELECT 1 FROM recruiters WHERE email = $1
      UNION ALL
      SELECT 1 FROM companies WHERE email = $1
    ) AS email_exists;
    `,
      [req.body.email]
    );
    if (rows[0].email_exists) {
      return next(
        ApiError.BAD_REQUEST("Акаунт з таким email вже зареєстровано")
      );
    }

    let photoUrl = null;
    try {
      const result = await CloudinaryService.uploadImage(
        req.file,
        "company",
        "image"
      );
      photoUrl = result.secure_url;
    } catch (uploadError) {
      return next(ApiError.INTERNAL_SERVER_ERROR("Помилка завантаження фото"));
    }
    console.log(req.user);
    const { rows: recruiters } = await client.query(
      `
      INSERT INTO recruiters (
      company_id, email, password, name, surname, photo
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    ) RETURNING *; 
    `,
      [
        req.user.id,
        req.body.email,
        bcrypt.hashSync(req.body.password, 5),
        req.body.name,
        req.body.surname,
        photoUrl,
      ]
    );

    if (!recruiters[0]) {
      return next(ApiError.BAD_REQUEST("Помилка при створені рекрутера"));
    }

    return ApiResponse.CREATED(res);
  } catch (error) {
    return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
  }
};

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

export const createRecruiterValidator = [
  check("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Ім'я повинно бути довжиною від 2 до 50 символів")
    .matches(/^[A-Za-zА-Яа-яЁёҐґІіЇїЄє\s'-]+$/)
    .withMessage("Ім'я містить недопустимі символи"),

  check("surname")
    .isLength({ min: 2, max: 50 })
    .withMessage("Прізвище повинно бути довжиною від 2 до 50 символів")
    .matches(/^[A-Za-zА-Яа-яЁёҐґІіЇїЄє\s'-]+$/)
    .withMessage("Прізвище містить недопустимі символи"),

  //   check("email")
  //     .isEmail()
  //     .withMessage("Некоректний формат email")
  //     .custom(validateCorporateEmail),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити більше 6 символів"),

  check("photo")
    .optional()
    .isURL()
    .withMessage("Фото повинне бути валідним URL-посиланням"),
];
