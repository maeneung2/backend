import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ZodSchema } from "zod";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export const auth = { security: [{ bearerAuth: [] }] };

export const body = (schema: ZodSchema) => ({
  body: { content: { "application/json": { schema } } },
});


export default registry;