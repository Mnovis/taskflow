import { prisma } from "../config/prisma";
import { BoardRole } from "@prisma/client";

export const boardRepository = {
  // Todos os boards em que o usuário é dono OU membro
  findAllForUser(userId: string) {
    return prisma.board.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: true } },
        _count: { select: { columns: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(boardId: string) {
    return prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: { include: { user: true } },
        columns: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              orderBy: { position: "asc" },
              include: { assignee: true },
            },
          },
        },
      },
    });
  },

  // Cria o board e já registra o criador como membro com papel OWNER,
  // em uma única transação — evita estado inconsistente.
  create(data: { title: string; description?: string; ownerId: string }) {
    return prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: { userId: data.ownerId, role: BoardRole.OWNER },
        },
      },
      include: { members: { include: { user: true } } },
    });
  },

  update(boardId: string, data: { title?: string; description?: string }) {
    return prisma.board.update({ where: { id: boardId }, data });
  },

  delete(boardId: string) {
    return prisma.board.delete({ where: { id: boardId } });
  },

  findMembership(boardId: string, userId: string) {
    return prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
  },

  addMember(boardId: string, userId: string) {
    return prisma.boardMember.create({
      data: { boardId, userId, role: BoardRole.MEMBER },
      include: { user: true },
    });
  },
};
