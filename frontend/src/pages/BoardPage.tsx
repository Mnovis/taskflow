import { useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Plus, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { BoardHeader } from "@/components/board/BoardHeader";
import { Column } from "@/components/board/Column";
import { Card as CardComponent } from "@/components/board/Card";
import { CardModal } from "@/components/board/CardModal";
import { useBoard } from "@/hooks/useBoard";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import { useCardMutations } from "@/hooks/useCardMutations";
import type { Card, Priority } from "@/types";

export function BoardPage() {
  const { boardId = "" } = useParams();
  const { board, isLoading, createColumn, deleteColumn, addMember } = useBoard(boardId);
  const { createCard, updateCard, deleteCard, moveCard } = useCardMutations(boardId);

  useBoardSocket(boardId);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Exige um pequeno deslocamento antes de iniciar o drag, para não
  // conflitar com o clique simples que abre o modal do card.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (isLoading || !board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as Card | undefined;
    if (card) setActiveCard(card);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board) return;

    const activeCardData = active.data.current?.card as Card | undefined;
    if (!activeCardData) return;

    const overType = over.data.current?.type as "card" | "column" | undefined;

    // Solto sobre outro card: move para a coluna desse card, na posição dele
    if (overType === "card") {
      const overCard = over.data.current?.card as Card;
      moveCard.mutate({
        cardId: activeCardData.id,
        targetColumnId: overCard.columnId,
        targetPosition: overCard.position,
      });
      return;
    }

    // Solto sobre uma coluna vazia (ou área da coluna): vai para o final dela
    if (overType === "column") {
      const targetColumn = board.columns.find((c) => c.id === over.id);
      if (!targetColumn) return;
      moveCard.mutate({
        cardId: activeCardData.id,
        targetColumnId: targetColumn.id,
        targetPosition: targetColumn.cards.length,
      });
    }
  }

  function handleAddColumn(e: FormEvent) {
    e.preventDefault();
    const title = newColumnTitle.trim();
    if (!title) return;
    createColumn.mutate(title, {
      onSuccess: () => {
        setNewColumnTitle("");
        setIsAddingColumn(false);
      },
    });
  }

  function handleSaveCard(
    cardId: string,
    data: { title: string; description?: string; priority: Priority; dueDate: string | null; assigneeId: string | null }
  ) {
    updateCard.mutate({ cardId, input: data });
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Navbar />
      <BoardHeader board={board} onInvite={(email) => addMember.mutateAsync(email)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-4 scrollbar-thin">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onCardClick={setSelectedCard}
              onAddCard={(columnId, title) =>
                createCard.mutate({ columnId, input: { title } })
              }
              onDeleteColumn={(columnId) => deleteColumn.mutate(columnId)}
            />
          ))}

          <div className="w-72 shrink-0">
            {isAddingColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="flex flex-col gap-2 rounded-xl bg-slate-100 p-3"
              >
                <input
                  autoFocus
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Nome da coluna..."
                  className="rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Adicionar coluna
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && <CardComponent card={activeCard} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={selectedCard}
        members={board.members}
        onClose={() => setSelectedCard(null)}
        onSave={handleSaveCard}
        onDelete={(cardId) => deleteCard.mutate(cardId)}
      />
    </div>
  );
}
