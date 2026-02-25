
import { Request, Response, NextFunction } from "express";

export function authorize(...roles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];

    const allowed = roles.some(r => userRoles.includes(r));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { message: "Forbidden" }
      });
    }

    next();
  };
}
