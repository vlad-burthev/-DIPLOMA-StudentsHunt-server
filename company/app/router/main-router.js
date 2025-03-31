import express from "express";
import companyRoutes from "../modules/company/company.routes.js";
import applicationRoutes from "../modules/application/application.routes.js";
import { handleUploadError } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Company routes
router.use("/companies", companyRoutes);

// Application routes
router.use("/applications", applicationRoutes);

// Error handling for file uploads
router.use(handleUploadError);

export default router;
