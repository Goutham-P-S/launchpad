
import { Router } from "express";
import { IntegrationController } from "../controllers/integration.controller";
import { validate } from "../middleware/validate";
import {
  createIntegrationSchema,
  updateIntegrationSchema
} from "../validation/integration.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"), // remove if you want open creation
  validate(createIntegrationSchema),
  asyncHandler(IntegrationController.create)
);

router.get(
  "/",
  // remove if public
  asyncHandler(IntegrationController.findAll)
);

router.get(
  "/:id",
  // remove if public
  asyncHandler(IntegrationController.findOne)
);

router.put(
  "/:id",
  authenticate,
  validate(updateIntegrationSchema),
  asyncHandler(IntegrationController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(IntegrationController.delete)
);

export default router;
