import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import type { BoardDetail, Card, Column } from "@/types";

const EVENTS = {
  COLUMN_CREATED: "column:created",
  COLUMN_UPDATED: "column:updated",
  COLUMN_DELETED: "column:deleted",
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_MOVED: "card:moved",
  CARD_DELETED: "card:deleted",
} as const;

// Conecta ao socket, entra na sala do board e mantém o cache do React
// Query sincronizado com as mudanças feitas por outros usuários
// conectados ao mesmo board — sem precisar de polling.
export function useBoardSocket(boardId: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryKey = ["board", boardId];

  useEffect(() => {
    if (!boardId || !accessToken) return;

    const socket = getSocket(accessToken);
    socket.emit("board:join", boardId);

    const updateBoard = (updater: (board: BoardDetail) => BoardDetail) => {
      queryClient.setQueryData<BoardDetail>(queryKey, (old) => (old ? updater(old) : old));
    };

    socket.on(EVENTS.COLUMN_CREATED, (column: Column) => {
      updateBoard((board) => ({
        ...board,
        columns: [...board.columns, { ...column, cards: [] }],
      }));
    });

    socket.on(EVENTS.COLUMN_UPDATED, (column: Column) => {
      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((c) => (c.id === column.id ? { ...c, ...column } : c)),
      }));
    });

    socket.on(EVENTS.COLUMN_DELETED, ({ id }: { id: string }) => {
      updateBoard((board) => ({
        ...board,
        columns: board.columns.filter((c) => c.id !== id),
      }));
    });

    socket.on(EVENTS.CARD_CREATED, (card: Card) => {
      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((col) =>
          col.id === card.columnId ? { ...col, cards: [...col.cards, card] } : col
        ),
      }));
    });

    socket.on(EVENTS.CARD_UPDATED, (card: Card) => {
      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          cards: col.cards.map((c) => (c.id === card.id ? card : c)),
        })),
      }));
    });

    socket.on(EVENTS.CARD_DELETED, ({ id }: { id: string }) => {
      updateBoard((board) => ({
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== id),
        })),
      }));
    });

    // Card movido: remove da coluna de origem e insere na coluna/posição
    // de destino — mesma lógica do optimistic update do useCardMutations,
    // mas aplicada aqui para eventos vindos de OUTROS usuários.
    socket.on(EVENTS.CARD_MOVED, (card: Card) => {
      updateBoard((board) => {
        const columnsWithoutCard = board.columns.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== card.id),
        }));

        return {
          ...board,
          columns: columnsWithoutCard.map((col) => {
            if (col.id !== card.columnId) return col;
            const cards = [...col.cards];
            cards.splice(card.position, 0, card);
            return { ...col, cards };
          }),
        };
      });
    });

    return () => {
      socket.emit("board:leave", boardId);
      socket.off(EVENTS.COLUMN_CREATED);
      socket.off(EVENTS.COLUMN_UPDATED);
      socket.off(EVENTS.COLUMN_DELETED);
      socket.off(EVENTS.CARD_CREATED);
      socket.off(EVENTS.CARD_UPDATED);
      socket.off(EVENTS.CARD_DELETED);
      socket.off(EVENTS.CARD_MOVED);
    };
  }, [boardId, accessToken, queryClient]);

  // Desconecta o socket completamente ao desmontar a aplicação (ex: logout)
  useEffect(() => () => disconnectSocket(), []);
}
