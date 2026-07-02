import { prisma } from "../config/prisma";

export const columnRepository = {
  findById(columnId: string) {
    return prisma.column.findUnique({ where: { id: columnId } });
  },

  countByBoard(boardId: string) {
    return prisma.column.count({ where: { boardId } });
  },

  create(data: { title: string; boardId: string; position: number }) {
    return prisma.column.create({ data });
  },

  update(columnId: string, data: { title?: string; position?: number }) {
    return prisma.column.update({ where: { id: columnId }, data });
  },

  delete(columnId: string) {
    return prisma.column.delete({ where: { id: columnId } });
  },
};
