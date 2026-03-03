import jwt from "jsonwebtoken";

const generateJWTToken = async (
  userId: string,
  userName: string,
): Promise<string> => {
  if (!process.env.JWT_SECRET_TOKEN) {
    return "";
  }

  return jwt.sign(
    {
      user_id: userId,
      user_name: userName,
    },
    process.env.JWT_SECRET_TOKEN,
    { expiresIn: "7d" },
  );
};

export default generateJWTToken;
