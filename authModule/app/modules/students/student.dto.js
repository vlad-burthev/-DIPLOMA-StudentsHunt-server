import { check, body } from "express-validator";

export const createVacancyValidator = [
  check("title")
    .trim()
    .notEmpty()
    .withMessage("Назва вакансії обовʼязкова")
    .isLength({ max: 100 })
    .withMessage("Максимальна довжина назви 100 символів"),

  check("description")
    .trim()
    .notEmpty()
    .withMessage("Опис вакансії обовʼязковий")
    .isLength({ max: 2000 })
    .withMessage("Максимальна довжина опису 2000 символів"),

  body("requirements")
    .isArray({ min: 1 })
    .withMessage("Вимоги не повинні бути пустими")
    .custom((values) => {
      return values.every((v) => typeof v === "string" && v.trim().length > 0);
    })
    .withMessage("Вимоги не повинні бути пустими")
    .customSanitizer((values) => values.map((v) => v.trim())),

  check("salary_from")
    .isFloat({ gt: 0 })
    .withMessage("Мінімальна зарплата має бути числом більше 0")
    .optional({ nullable: true }),

  check("salary_to")
    .isFloat({ gt: 0 })
    .withMessage("Максимальна зарплата має бути числом більше 0")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value && req.body.salary_from && value < req.body.salary_from) {
        throw new Error(
          "Максимальна зарплата не може бути меншою за мінімальну"
        );
      }
      return true;
    }),

  check("currency")
    .isIn(["$", "€", "₴"])
    .withMessage("Допустимі валюти: $, €, ₴")
    .optional({ nullable: true }),

  check("location")
    .trim()
    .notEmpty()
    .withMessage("Локація обовʼязкова")
    .isLength({ max: 100 })
    .withMessage("Максимальна довжина локації 100 символів"),

  check("work_type")
    .isIn([1, 2, 3])
    .withMessage("Допустимі типи роботи: office, remote, hybrid"),

  body().custom((body) => {
    const allowedFields = [
      "title",
      "description",
      "requirements",
      "salary_from",
      "salary_to",
      "currency",
      "location",
      "work_type",
    ];
    const invalidFields = Object.keys(body).filter(
      (f) => !allowedFields.includes(f)
    );
    if (invalidFields.length) {
      throw new Error(`Неприпустимі поля: ${invalidFields.join(", ")}`);
    }
    return true;
  }),
];
