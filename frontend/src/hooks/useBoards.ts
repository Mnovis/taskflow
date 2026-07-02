import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

// Lista os boards do dashboard + mutation de criação, com invalidação
// automática da lista após criar um novo board.
export function useBoards() {
  const queryClient = useQueryClient();

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: boardService.list,
  });

  const createBoard = useMutation({
    mutationFn: boardService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const deleteBoard = useMutation({
    mutationFn: boardService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return {
    boards: boardsQuery.data ?? [],
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,
    createBoard,
    deleteBoard,
  };
}
