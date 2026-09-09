import { JwtPayload } from "jsonwebtoken";
import User from "../interface/user";

declare global {
  namespace Express {
    interface Request {
      user?: User & JwtPayload;
    }
  }
}