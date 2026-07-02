import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const cardRepository = {
  findById(cardId: string) {
    return prisma.card.findUnique({
      where: { id: cardId },
      include: { assignee: true, column: true },
    });
  },

  countByColumn(columnId: string) {
    return prisma.card.count({ where: { columnId } });
  },

  create(data: {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: Date | null;
    assigneeId?: string | null;
    columnId: string;
    position: number;
  }) {
    return prisma.card.create({ data, include: { assignee: true } });
  },

  update(cardId: string, data: Prisma.CardUpdateInput) {
    return prisma.card.update({
      where: { id: cardId },
      data,
      include: { assignee: true },
    });
  },

  delete(cardId: string) {
    return prisma.card.delete({ where: { id: cardId } });
  },

  // Move um card entre colunas (ou dentro da mesma coluna) e reordena
  // os cards afetados, tudo em uma transação para manter consistência
  // das posições mesmo com múltiplos usuários movendo cards ao mesmo tempo.
  async move(cardId: string, targetColumnId: string, targetPosition: number) {
    return prisma.$transaction(async (tx) => {
      const card = await tx.card.findUniqueOrThrow({ where: { id: cardId } });
      const sourceColumnId = card.columnId;

      if (sourceColumnId === targetColumnId) {
        // Reordenando dentro da mesma coluna
        if (targetPosition > card.position) {
          await tx.card.updateMany({
            where: {
              columnId: sourceColumnId,
              position: { gt: card.position, lte: targetPosition },
            },
            data: { position: { decrement: 1 } },
          });
        } else if (targetPosition < card.position) {
          await tx.card.updateMany({
            where: {
              columnId: sourceColumnId,
              position: { gte: targetPosition, lt: card.position },
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Movendo para outra coluna: fecha o "buraco" na coluna de origem...
        await tx.card.updateMany({
          where: { columnId: sourceColumnId, position: { gt: card.position } },
          data: { position: { decrement: 1 } },
        });
        // ...e abre espaço na coluna de destino
        await tx.card.updateMany({
          where: { columnId: targetColumnId, position: { gte: targetPosition } },
          data: { position: { increment: 1 } },
        });
      }

      return tx.card.update({
        where: { id: cardId },
        data: { columnId: targetColumnId, position: targetPosition },
        include: { assignee: true },
      });
    });
  },
};
