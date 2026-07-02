import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

// Middleware de validação genérico e reutilizável: recebe um schema Zod
// que descreve `body`, `params` e/ou `query`, valida a requisição inteira
// de uma vez e substitui `req.body`/`req.params` pelos dados já
// parseados (e com defaults/coerções aplicados pelo Zod).
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return next(AppError.badRequest(`Dados inválidos: ${messages}`));
      }
      next(error);
    }
  };
}
