import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService, CardInput } from "@/services/card.service";
import type { BoardDetail, Card } from "@/types";

// Centraliza as mutations de card usadas tanto pelo modal de edição
// quanto pelo drag-and-drop. O destaque é `moveCard`: aplica uma
// atualização otimista no cache do React Query para o board reagir
// instantaneamente ao arrastar, sem esperar a resposta do servidor —
// e reverte automaticamente se a requisição falhar.
export function useCardMutations(boardId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["board", boardId];

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createCard = useMutation({
    mutationFn: ({ columnId, input }: { columnId: string; input: CardInput }) =>
      cardService.create(columnId, input),
    onSuccess: invalidate,
  });

  const updateCard = useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: Partial<CardInput> }) =>
      cardService.update(cardId, input),
    onSuccess: invalidate,
  });

  const deleteCard = useMutation({
    mutationFn: (cardId: string) => cardService.delete(cardId),
    onSuccess: invalidate,
  });

  const moveCard = useMutation({
    mutationFn: ({
      cardId,
      targetColumnId,
      targetPosition,
    }: {
      cardId: string;
      targetColumnId: string;
      targetPosition: number;
    }) => cardService.move(cardId, targetColumnId, targetPosition),

    onMutate: async ({ cardId, targetColumnId, targetPosition }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousBoard = queryClient.getQueryData<BoardDetail>(queryKey);
      if (!previousBoard) return { previousBoard };

      const nextBoard = optimisticallyMoveCard(previousBoard, cardId, targetColumnId, targetPosition);
      queryClient.setQueryData(queryKey, nextBoard);

      return { previousBoard };
    },

    onError: (_err, _vars, context) => {
      // Reverte para o estado anterior se o servidor rejeitar o movimento
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKey, context.previousBoard);
      }
    },

    onSettled: invalidate,
  });

  return { createCard, updateCard, deleteCard, moveCard };
}

function optimisticallyMoveCard(
  board: BoardDetail,
  cardId: string,
  targetColumnId: string,
  targetPosition: number
): BoardDetail {
  let movedCard: Card | undefined;

  // Remove o card de onde estiver
  const columnsWithoutCard = board.columns.map((column) => {
    const found = column.cards.find((c) => c.id === cardId);
    if (found) movedCard = found;
    return { ...column, cards: column.cards.filter((c) => c.id !== cardId) };
  });

  if (!movedCard) return board;

  const updatedCard = { ...movedCard, columnId: targetColumnId, position: targetPosition };

  const columns = columnsWithoutCard.map((column) => {
    if (column.id !== targetColumnId) return column;
    const cards = [...column.cards];
    cards.splice(targetPosition, 0, updatedCard);
    return { ...column, cards };
  });

  return { ...board, columns };
}
