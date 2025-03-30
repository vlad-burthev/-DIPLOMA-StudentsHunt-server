import { Router } from "express";
import { VacaancyController } from "./vacancy.controller.js";

export const vacancyRoutes = new Router();

vacancyRoutes.get("/all_vacancies", VacaancyController.getAllVacancies);
