
import { Router } from "express";
import { DataSyncController } from "../controllers/datasync.controller";
import { validate } from "../middleware/validate";
import {
  createDataSyncSchema,
  updateDataSyncSchema
} from "../validation/datasync.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"), // remove if you want open creation
  validate(createDataSyncSchema),
  asyncHandler(DataSyncController.create)
);

router.get(
  "/",
  // remove if public
  asyncHandler(DataSyncController.findAll)
);

router.get(
  "/:id",
  // remove if public
  asyncHandler(DataSyncController.findOne)
);

router.put(
  "/:id",
  authenticate,
  validate(updateDataSyncSchema),
  asyncHandler(DataSyncController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(DataSyncController.delete)
);

export default router;
