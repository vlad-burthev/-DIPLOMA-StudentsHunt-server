import { check, validationResult } from "express-validator";
import client from "../../../db.config.js";
import CloudinaryService from "../../../../services/cloudnary.service.js";
import bcrypt from "bcrypt";
import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import { publicEmailDomains } from "../../../../common/commonData/publicMails.js";

export const createRecruiterService = async (req, res, next) => {
  let cloudinaryPublicId = null;

  try {
    // Валидация входящих данных
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Проверка наличия файла изображения
    if (!req.file) {
      throw ApiError.BAD_REQUEST("Файл не знайдено");
    }

    // Проверка существования email в таблицах recruiters и companies
    const emailCheckQuery = `
      SELECT EXISTS (
        SELECT 1 FROM recruiters WHERE email = $1
        UNION ALL
        SELECT 1 FROM companies WHERE email = $1
      ) AS email_exists;
    `;
    const { rows: emailCheckResult } = await client.query(emailCheckQuery, [
      req.body.email,
    ]);

    if (emailCheckResult[0].email_exists) {
      throw ApiError.BAD_REQUEST("Акаунт з таким email вже зареєстровано");
    }

    // Загрузка изображения в Cloudinary
    const uploadResult = await CloudinaryService.uploadImage(
      req.file,
      "company",
      "image"
    );
    cloudinaryPublicId = uploadResult.public_id;
    const photoUrl = uploadResult.secure_url;

    // Асинхронное хеширование пароля
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Формирование запроса для создания рекрутера
    const createRecruiterQuery = `
      INSERT INTO recruiters (
        company_id, email, password, name, surname, photo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, surname, photo;
    `;
    const trimmedName = req.body.name.trim();
    const trimmedSurname = req.body.surname.trim();
    const { rows: recruiterRows } = await client.query(createRecruiterQuery, [
      req.user.id,
      req.body.email,
      hashedPassword,
      trimmedName,
      trimmedSurname,
      photoUrl,
    ]);

    const newRecruiter = recruiterRows[0];
    if (!newRecruiter) {
      throw ApiError.BAD_REQUEST("Помилка при створенні рекрутера");
    }

    return ApiResponse.CREATED(res, newRecruiter);
  } catch (error) {
    // При ошибке, если изображение было загружено, удаляем его из Cloudinary
    if (cloudinaryPublicId) {
      try {
        await CloudinaryService.deleteImage(cloudinaryPublicId);
      } catch (deleteError) {
        console.error("Error deleting Cloudinary image:", deleteError);
      }
    }
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
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ім'я повинно бути довжиною від 2 до 50 символів")
    .matches(/^[A-Za-zА-Яа-яЁёҐґІіЇїЄє'\-\s]+$/)
    .withMessage("Ім'я містить недопустимі символи"),
  check("surname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Прізвище повинно бути довжиною від 2 до 50 символів")
    .matches(/^[A-Za-zА-Яа-яЁёҐґІіЇїЄє'\-\s]+$/)
    .withMessage("Прізвище містить недопустимі символи"),
  // check("email")
  //   .isEmail()
  //   .withMessage("Некоректний формат email")
  //   .custom(validateCorporateEmail),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Пароль повинен містити мінімум 6 символів"),
];
