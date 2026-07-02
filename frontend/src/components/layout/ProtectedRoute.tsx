import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isRestoring } = useAuth();

  // Enquanto tenta restaurar a sessão a partir do cookie de refresh
  // token, mostra um loading em vez de redirecionar prematuramente
  // para o login (evita "flash" de redirecionamento indevido).
  if (isRestoring) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
