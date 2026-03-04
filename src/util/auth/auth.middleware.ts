import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../interface/user";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  const secret = process.env.JWT_SECRET_TOKEN as string;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // 검증된 데이터를 req.user에 할당 (타입 캐스팅)
    (req as any).user = decoded as User;
    next();
  });
};

export default authenticateToken;
