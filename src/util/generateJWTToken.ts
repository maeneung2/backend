import jwt from "jsonwebtoken";

const generateJWTToken = (
  type: "access" | "refresh",
  data: object,
): string => {
  return jwt.sign(
    data,
    type === "access"
      ? process.env.JWT_SECRET_TOKEN!
      : process.env.JWT_SECRET_REFRESH_TOKEN!,
    {
      expiresIn: type === "access" ? "30m" : "7d",
    },
  );
};

export default generateJWTToken;
