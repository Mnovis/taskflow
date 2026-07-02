import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useBoards } from "@/hooks/useBoards";

export function DashboardPage() {
  const { boards, isLoading, createBoard, deleteBoard } = useBoards();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createBoard.mutate(
      { title: title.trim(), description: description.trim() || undefined },
      { onSuccess: () => { setTitle(""); setDescription(""); setIsCreating(false); } }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Seus boards</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo board
          </Button>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Carregando boards...</p>}

        {!isLoading && boards.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
            <p className="text-slate-500">Você ainda não tem nenhum board.</p>
            <Button onClick={() => setIsCreating(true)}>Criar o primeiro board</Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <Link to={`/boards/${board.id}`} className="block">
                <h2 className="font-medium text-slate-900">{board.title}</h2>
                {board.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{board.description}</p>
                )}
                <p className="mt-3 text-xs text-slate-400">
                  {board._count?.columns ?? 0} colunas · {board.members.length}{" "}
                  {board.members.length === 1 ? "membro" : "membros"}
                </p>
              </Link>
              <button
                onClick={() => deleteBoard.mutate(board.id)}
                aria-label="Excluir board"
                className="absolute right-3 top-3 rounded p-1 text-slate-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Criar novo board">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createBoard.isPending}>
              Criar board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
