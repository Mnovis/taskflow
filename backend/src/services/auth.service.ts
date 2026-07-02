import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";

function buildTokens(userId: string) {
  return {
    accessToken: signAccessToken({ userId }),
    refreshToken: signRefreshToken({ userId }),
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("Já existe uma conta com este e-mail");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return {
      user: userRepository.toPublic(user),
      ...buildTokens(user.id),
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized("E-mail ou senha inválidos");
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized("E-mail ou senha inválidos");
    }

    return {
      user: userRepository.toPublic(user),
      ...buildTokens(user.id),
    };
  },

  // Recebe um refresh token válido e emite um novo par de tokens
  // (rotação de refresh token — mitiga replay de token roubado).
  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Refresh token inválido ou expirado");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized("Usuário não encontrado");
    }

    return buildTokens(user.id);
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("Usuário não encontrado");
    return userRepository.toPublic(user);
  },
};
