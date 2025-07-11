import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" });
  }

  // @ts-ignore
  req.userId = userId;
  next();
}
