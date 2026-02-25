
import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";
import { success } from "../utils/apiResponse";

export const CustomerController = {

  create: async (req: Request, res: Response) => {
    const result = await CustomerService.create(req.body);
    res.json(success(result));
  },

  findAll: async (req: Request, res: Response) => {
    const result = await CustomerService.findAll(req.query);
    res.json(success(result.data, result.meta));
  },

  findOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CustomerService.findOne(id);
    res.json(success(result));
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CustomerService.update(id, req.body);
    res.json(success(result));
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await CustomerService.delete(id);
    res.json(success(result));
  }
};
