import { prisma } from "../src/config/prisma";

// Limpa todas as tabelas na ordem correta (respeitando foreign keys),
// chamado antes de cada teste para garantir isolamento entre eles.
export async function resetDatabase() {
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
