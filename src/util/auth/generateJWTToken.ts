import jwt from "jsonwebtoken";

const generateJWTToken = async (
  type: "access" | "refresh",
  data: Object,
): Promise<string> => {
  return jwt.sign(
    data,
    type === "access"
      ? process.env.JWT_SECRET_TOKEN!
      : process.env.JWT_SECRET_REFRESH_TOKEN!,
    {
      expiresIn: type === "access" ? "20s" : "7d",
    },
  );
};

export default generateJWTToken;
