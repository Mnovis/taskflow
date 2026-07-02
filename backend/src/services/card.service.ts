import { cardRepository } from "../repositories/card.repository";
import { columnService } from "./column.service";
import { boardService } from "./board.service";
import { AppError } from "../utils/AppError";
import type { CreateCardInput, UpdateCardInput, MoveCardInput } from "../schemas/card.schema";

export const cardService = {
  async create(columnId: string, input: CreateCardInput, userId: string) {
    const column = await columnService.findOrThrow(columnId);
    await boardService.assertMembership(column.boardId, userId);

    const position = await cardRepository.countByColumn(columnId);

    return cardRepository.create({
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assigneeId: input.assigneeId ?? null,
      columnId,
      position,
    });
  },

  async update(cardId: string, input: UpdateCardInput, userId: string) {
    const card = await this.findOrThrow(cardId);
    await boardService.assertMembership(card.column.boardId, userId);

    return cardRepository.update(cardId, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
      ...(input.assigneeId !== undefined && {
        assignee: input.assigneeId
          ? { connect: { id: input.assigneeId } }
          : { disconnect: true },
      }),
    });
  },

  async delete(cardId: string, userId: string) {
    const card = await this.findOrThrow(cardId);
    await boardService.assertMembership(card.column.boardId, userId);
    return cardRepository.delete(cardId);
  },

  async move(cardId: string, input: MoveCardInput, userId: string) {
    const card = await this.findOrThrow(cardId);
    await boardService.assertMembership(card.column.boardId, userId);

    // Garante que a coluna de destino pertence ao mesmo board
    const targetColumn = await columnService.findOrThrow(input.targetColumnId);
    if (targetColumn.boardId !== card.column.boardId) {
      throw AppError.badRequest("A coluna de destino pertence a outro board");
    }

    return cardRepository.move(cardId, input.targetColumnId, input.targetPosition);
  },

  async findOrThrow(cardId: string) {
    const card = await cardRepository.findById(cardId);
    if (!card) throw AppError.notFound("Card não encontrado");
    return card;
  },
};
