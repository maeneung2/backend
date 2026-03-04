import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import registry from "./registry";

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Find Bibun API",
      version: "1.0.0",
      description: "Find Bibun 백엔드 API 문서",
    },
    servers: [{ url: "http://localhost:3000" }],
  });
};