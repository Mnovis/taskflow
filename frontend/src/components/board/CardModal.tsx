import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Card, Priority, BoardMember } from "@/types";

interface CardModalProps {
  card: Card | null;
  members: BoardMember[];
  onClose: () => void;
  onSave: (cardId: string, data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate: string | null;
    assigneeId: string | null;
  }) => void;
  onDelete: (cardId: string) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
];

export function CardModal({ card, members, onClose, onSave, onDelete }: CardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  // Sincroniza o estado local do formulário sempre que um card diferente é aberto
  useEffect(() => {
    if (!card) return;
    setTitle(card.title);
    setDescription(card.description ?? "");
    setPriority(card.priority);
    setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : "");
    setAssigneeId(card.assigneeId ?? "");
  }, [card]);

  if (!card) return null;

  function handleSave() {
    if (!card || !title.trim()) return;
    onSave(card.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeId: assigneeId || null,
    });
    onClose();
  }

  return (
    <Modal isOpen onClose={onClose} title="Editar tarefa">
      <div className="flex flex-col gap-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Data de entrega"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Responsável</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sem responsável</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(card.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Excluir tarefa
          </button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
