import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Board } from "@/types";

interface BoardHeaderProps {
  board: Board;
  onInvite: (email: string) => Promise<void>;
}

export function BoardHeader({ board, onInvite }: BoardHeaderProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleInvite() {
    setError(null);
    setIsSubmitting(true);
    try {
      await onInvite(email.trim());
      setEmail("");
      setIsInviting(false);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Não foi possível adicionar este colaborador");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4">
      <div className="mx-auto flex max-w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-slate-500">{board.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-4 w-4" />
            {board.members.length} {board.members.length === 1 ? "membro" : "membros"}
          </div>

          {isInviting ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
                className="w-56"
              />
              <Button onClick={handleInvite} isLoading={isSubmitting} disabled={!email}>
                Convidar
              </Button>
              <Button variant="ghost" onClick={() => setIsInviting(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setIsInviting(true)}>
              <UserPlus className="h-4 w-4" />
              Convidar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
