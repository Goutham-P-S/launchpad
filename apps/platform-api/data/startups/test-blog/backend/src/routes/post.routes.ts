
import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { validate } from "../middleware/validate";
import {
  createPostSchema,
  updatePostSchema
} from "../validation/post.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"), // remove if you want open creation
  validate(createPostSchema),
  asyncHandler(PostController.create)
);

router.get(
  "/",
  // remove if public
  asyncHandler(PostController.findAll)
);

router.get(
  "/:id",
  // remove if public
  asyncHandler(PostController.findOne)
);

router.put(
  "/:id",
  authenticate,
  validate(updatePostSchema),
  asyncHandler(PostController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(PostController.delete)
);

export default router;
