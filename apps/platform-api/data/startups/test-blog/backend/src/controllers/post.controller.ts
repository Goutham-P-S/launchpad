
import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { success } from "../utils/apiResponse";

export const PostController = {

  create: async (req: Request, res: Response) => {
    const result = await PostService.create(req.body);
    res.json(success(result));
  },

  findAll: async (req: Request, res: Response) => {
    const result = await PostService.findAll(req.query);
    res.json(success(result.data, result.meta));
  },

  findOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await PostService.findOne(id);
    res.json(success(result));
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await PostService.update(id, req.body);
    res.json(success(result));
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await PostService.delete(id);
    res.json(success(result));
  }
};
