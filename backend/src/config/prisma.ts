import { PrismaClient } from "@prisma/client";

// Reutiliza uma única instância do PrismaClient em toda a aplicação.
// Em dev, com hot-reload (tsx watch), evita esgotar o pool de conexões
// do Postgres criando um client novo a cada reload.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
