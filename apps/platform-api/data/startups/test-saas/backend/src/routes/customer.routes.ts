
import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { validate } from "../middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema
} from "../validation/customer.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"), // remove if you want open creation
  validate(createCustomerSchema),
  asyncHandler(CustomerController.create)
);

router.get(
  "/",
  // remove if public
  asyncHandler(CustomerController.findAll)
);

router.get(
  "/:id",
  // remove if public
  asyncHandler(CustomerController.findOne)
);

router.put(
  "/:id",
  authenticate,
  validate(updateCustomerSchema),
  asyncHandler(CustomerController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(CustomerController.delete)
);

export default router;
