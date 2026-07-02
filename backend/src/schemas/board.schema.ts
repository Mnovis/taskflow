import { z } from "zod";

export const createBoardSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Título é obrigatório").max(80),
    description: z.string().trim().max(500).optional(),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(500).optional(),
  }),
});

export const boardIdParamSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
});

export const addMemberSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
  body: z.object({
    email: z.string().trim().toLowerCase().email("E-mail inválido"),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>["body"];
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>["body"];
