import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "./Card";
import type { Column as ColumnType, Card as CardType } from "@/types";

interface ColumnProps {
  column: ColumnType;
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function Column({ column, onCardClick, onAddCard, onDeleteColumn }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef } = useDroppable({ id: column.id, data: { type: "column", column } });

  function handleSubmitNewCard() {
    const title = newCardTitle.trim();
    if (title) onAddCard(column.id, title);
    setNewCardTitle("");
    setIsAddingCard(false);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          {column.title}
          <span className="ml-2 text-xs font-normal text-slate-400">{column.cards.length}</span>
        </h3>

        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Opções da coluna"
            className="rounded p-1 text-slate-400 hover:bg-slate-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  onDeleteColumn(column.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir coluna
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="flex min-h-[8px] flex-col gap-2">
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      {isAddingCard ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            autoFocus
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitNewCard();
              }
            }}
            placeholder="Título da tarefa..."
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitNewCard}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Adicionar
            </button>
            <button
              onClick={() => setIsAddingCard(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200"
        >
          <Plus className="h-4 w-4" />
          Adicionar tarefa
        </button>
      )}
    </div>
  );
}
