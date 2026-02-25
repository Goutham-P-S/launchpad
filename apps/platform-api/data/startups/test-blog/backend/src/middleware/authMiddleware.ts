
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid token" } });
  }
}
