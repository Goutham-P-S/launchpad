
import { Request, Response } from "express";
import { CommentService } from "../services/comment.service";
import { success } from "../utils/apiResponse";

export const CommentController = {

  create: async (req: Request, res: Response) => {
    const result = await CommentService.create(req.body);
    res.json(success(result));
  },

  findAll: async (req: Request, res: Response) => {
    const result = await CommentService.findAll(req.query);
    res.json(success(result.data, result.meta));
  },

  findOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CommentService.findOne(id);
    res.json(success(result));
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CommentService.update(id, req.body);
    res.json(success(result));
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CommentService.delete(id);
    res.json(success(result));
  }
};
