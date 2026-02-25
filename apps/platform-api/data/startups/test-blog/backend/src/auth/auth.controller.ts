
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { success } from "../utils/apiResponse";

export const AuthController = {

  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await AuthService.register(email, password);
    res.json(success(user));
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(success(result));
  }
};
