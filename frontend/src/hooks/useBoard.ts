import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["board", boardId];

  const boardQuery = useQuery({
    queryKey,
    queryFn: () => boardService.getById(boardId),
    enabled: Boolean(boardId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createColumn = useMutation({
    mutationFn: (title: string) => boardService.createColumn(boardId, title),
    onSuccess: invalidate,
  });

  const updateColumn = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      boardService.updateColumn(columnId, { title }),
    onSuccess: invalidate,
  });

  const deleteColumn = useMutation({
    mutationFn: (columnId: string) => boardService.deleteColumn(columnId),
    onSuccess: invalidate,
  });

  const addMember = useMutation({
    mutationFn: (email: string) => boardService.addMember(boardId, email),
    onSuccess: invalidate,
  });

  return {
    board: boardQuery.data,
    isLoading: boardQuery.isLoading,
    isError: boardQuery.isError,
    refetch: boardQuery.refetch,
    createColumn,
    updateColumn,
    deleteColumn,
    addMember,
  };
}
