import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

// Middleware central de erros — TODA falha da aplicação passa por aqui.
// Deve ser o último middleware registrado no Express (4 argumentos
// sinalizam ao Express que é um error handler).
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erros operacionais previstos (AppError.notFound, .conflict, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erros conhecidos do Prisma (ex: violação de unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Registro já existe (violação de unicidade)" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
  }

  // Erro não previsto: loga completo no servidor, mas não vaza detalhes
  // internos para o cliente em produção.
  console.error("💥 Erro não tratado:", err);

  return res.status(500).json({
    error: "Erro interno do servidor",
    ...(env.NODE_ENV !== "production" && {
      details: err instanceof Error ? err.message : String(err),
    }),
  });
}
