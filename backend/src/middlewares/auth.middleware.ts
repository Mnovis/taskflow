import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";

// Protege rotas exigindo um access token JWT válido no header
// Authorization: Bearer <token>. Em caso de sucesso, anexa `req.user`
// para uso pelos controllers/services seguintes.
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Token de acesso ausente"));
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId };
    next();
  } catch {
    next(AppError.unauthorized("Token de acesso inválido ou expirado"));
  }
}
