
import { Request, Response } from "express";
import { IntegrationService } from "../services/integration.service";
import { success } from "../utils/apiResponse";

export const IntegrationController = {

  create: async (req: Request, res: Response) => {
    const result = await IntegrationService.create(req.body);
    res.json(success(result));
  },

  findAll: async (req: Request, res: Response) => {
    const result = await IntegrationService.findAll(req.query);
    res.json(success(result.data, result.meta));
  },

  findOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await IntegrationService.findOne(id);
    res.json(success(result));
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await IntegrationService.update(id, req.body);
    res.json(success(result));
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await IntegrationService.delete(id);
    res.json(success(result));
  }
};
