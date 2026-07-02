import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { env } from "../config/env";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  // Em produção, frontend e backend normalmente vivem em domínios
  // diferentes (ex: vercel.app e onrender.com). Cookies "cross-site"
  // só são enviados pelo navegador com SameSite=None — e SameSite=None
  // exige Secure=true (HTTPS) por especificação. Em dev, ambos rodam
  // em localhost (mesma "site"), então Lax funciona normalmente.
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: "/api/auth",
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ user, accessToken });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ user, accessToken });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenFromCookie = req.cookies?.[REFRESH_COOKIE];
      const { accessToken, refreshToken } = await authService.refresh(tokenFromCookie);
      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.status(204).send();
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },
};