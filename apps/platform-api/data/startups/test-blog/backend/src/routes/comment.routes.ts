
import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { validate } from "../middleware/validate";
import {
  createCommentSchema,
  updateCommentSchema
} from "../validation/comment.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"), // remove if you want open creation
  validate(createCommentSchema),
  asyncHandler(CommentController.create)
);

router.get(
  "/",
  // remove if public
  asyncHandler(CommentController.findAll)
);

router.get(
  "/:id",
  // remove if public
  asyncHandler(CommentController.findOne)
);

router.put(
  "/:id",
  authenticate,
  validate(updateCommentSchema),
  asyncHandler(CommentController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(CommentController.delete)
);

export default router;
