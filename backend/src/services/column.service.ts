import { columnRepository } from "../repositories/column.repository";
import { boardService } from "./board.service";
import { AppError } from "../utils/AppError";
import type { CreateColumnInput, UpdateColumnInput } from "../schemas/column.schema";

export const columnService = {
  async create(boardId: string, input: CreateColumnInput, userId: string) {
    await boardService.assertMembership(boardId, userId);
    const position = await columnRepository.countByBoard(boardId);
    return columnRepository.create({ ...input, boardId, position });
  },

  async update(columnId: string, input: UpdateColumnInput, userId: string) {
    const column = await this.findOrThrow(columnId);
    await boardService.assertMembership(column.boardId, userId);
    return columnRepository.update(columnId, input);
  },

  async delete(columnId: string, userId: string) {
    const column = await this.findOrThrow(columnId);
    await boardService.assertMembership(column.boardId, userId);
    return columnRepository.delete(columnId);
  },

  async findOrThrow(columnId: string) {
    const column = await columnRepository.findById(columnId);
    if (!column) throw AppError.notFound("Coluna não encontrada");
    return column;
  },
};
