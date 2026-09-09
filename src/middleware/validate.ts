import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "입력값이 올바르지 않습니다.",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };