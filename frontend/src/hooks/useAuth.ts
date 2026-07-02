import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import type { LoginFormData, RegisterFormData } from "@/schemas/auth.schema";

// Encapsula todo o ciclo de vida de autenticação: login, registro, logout
// e a restauração de sessão ao carregar a página (já que o access token
// vive só em memória e se perde num F5).
export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setSession, clearSession } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ao montar a aplicação, tenta trocar o cookie de refresh token por
  // um novo access token — se o cookie ainda for válido, a sessão
  // é restaurada silenciosamente sem pedir login de novo.
  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await authService.refresh();
        const currentUser = await authService.me();
        setSession(currentUser, accessToken);
      } catch {
        clearSession();
      } finally {
        setIsRestoring(false);
      }
    }
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (input: LoginFormData) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const { user: loggedUser, accessToken } = await authService.login(input);
        setSession(loggedUser, accessToken);
        navigate("/dashboard");
      } catch (err: any) {
        setError(err.response?.data?.error ?? "Não foi possível entrar. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, setSession]
  );

  const register = useCallback(
    async (input: RegisterFormData) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const { user: newUser, accessToken } = await authService.register(input);
        setSession(newUser, accessToken);
        navigate("/dashboard");
      } catch (err: any) {
        setError(err.response?.data?.error ?? "Não foi possível criar a conta.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, setSession]
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clearSession();
    navigate("/login");
  }, [navigate, clearSession]);

  return { user, isAuthenticated, isRestoring, error, isSubmitting, login, register, logout };
}
