
import { Request, Response } from "express";
import { DataSyncService } from "../services/datasync.service";
import { success } from "../utils/apiResponse";

export const DataSyncController = {

  create: async (req: Request, res: Response) => {
    const result = await DataSyncService.create(req.body);
    res.json(success(result));
  },

  findAll: async (req: Request, res: Response) => {
    const result = await DataSyncService.findAll(req.query);
    res.json(success(result.data, result.meta));
  },

  findOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await DataSyncService.findOne(id);
    res.json(success(result));
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await DataSyncService.update(id, req.body);
    res.json(success(result));
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await DataSyncService.delete(id);
    res.json(success(result));
  }
};
