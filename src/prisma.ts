import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // connectionString: "postgresql://postgres:qwer1234@localhost:4387/schedule",
});

const prisma = new PrismaClient({ adapter });

export default prisma;
