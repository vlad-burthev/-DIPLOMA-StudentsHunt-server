import express from "express";
import { RecruiterController } from "./recruiter.controller.js";
import { checkAuthMiddleware } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { recruiterSchemas } from "./recruiter.schemas.js";
import { upload } from "../../../middlewares/upload.middleware.js";

const router = express.Router();
const recruiterController = new RecruiterController();

// Public routes
router.post(
  "/accept-invitation/:token",
  validateRequest(recruiterSchemas.acceptInvitationSchema, "params"),
  recruiterController.acceptInvitation
);

// Protected routes
router.use(checkAuthMiddleware);

router.post(
  "/",
  upload.single("photo"),
  validateRequest(recruiterSchemas.createRecruiterSchema),
  recruiterController.createRecruiter
);

router.get(
  "/:id",
  validateRequest(recruiterSchemas.getRecruiterSchema, "params"),
  recruiterController.getRecruiterById
);

router.put(
  "/:id",
  upload.single("photo"),
  validateRequest(recruiterSchemas.updateRecruiterSchema),
  recruiterController.updateRecruiter
);

router.delete(
  "/:id",
  validateRequest(recruiterSchemas.deleteRecruiterSchema, "params"),
  recruiterController.deleteRecruiter
);

router.get(
  "/company/recruiters",
  validateRequest(recruiterSchemas.getCompanyRecruitersSchema, "query"),
  recruiterController.getCompanyRecruiters
);

export default router;
