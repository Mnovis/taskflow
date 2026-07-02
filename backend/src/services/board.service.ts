import { boardRepository } from "../repositories/board.repository";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import type { CreateBoardInput, UpdateBoardInput } from "../schemas/board.schema";

export const boardService = {
  listForUser(userId: string) {
    return boardRepository.findAllForUser(userId);
  },

  async getById(boardId: string, userId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw AppError.notFound("Board não encontrado");

    await this.assertMembership(boardId, userId);
    return board;
  },

  create(input: CreateBoardInput, ownerId: string) {
    return boardRepository.create({ ...input, ownerId });
  },

  async update(boardId: string, input: UpdateBoardInput, userId: string) {
    await this.assertOwnership(boardId, userId);
    return boardRepository.update(boardId, input);
  },

  async delete(boardId: string, userId: string) {
    await this.assertOwnership(boardId, userId);
    return boardRepository.delete(boardId);
  },

  // Adiciona um colaborador existente ao board pelo e-mail (sem envio
  // real de convite, conforme escopo do projeto).
  async addMember(boardId: string, email: string, requesterId: string) {
    await this.assertOwnership(boardId, requesterId);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.notFound("Nenhum usuário cadastrado com este e-mail");
    }

    const alreadyMember = await boardRepository.findMembership(boardId, user.id);
    if (alreadyMember) {
      throw AppError.conflict("Usuário já é membro deste board");
    }

    return boardRepository.addMember(boardId, user.id);
  },

  // Garante que o usuário tem qualquer nível de acesso ao board
  // (dono ou membro convidado).
  async assertMembership(boardId: string, userId: string) {
    const membership = await boardRepository.findMembership(boardId, userId);
    if (!membership) {
      throw AppError.forbidden("Você não tem acesso a este board");
    }
    return membership;
  },

  // Garante que o usuário é especificamente o dono (necessário para
  // ações destrutivas/administrativas: editar título, excluir, convidar).
  async assertOwnership(boardId: string, userId: string) {
    const membership = await this.assertMembership(boardId, userId);
    if (membership.role !== "OWNER") {
      throw AppError.forbidden("Apenas o dono do board pode realizar esta ação");
    }
    return membership;
  },
};
