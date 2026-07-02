import { z } from "zod";

export const createColumnSchema = z.object({
  params: z.object({ boardId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(1, "Título é obrigatório").max(50),
  }),
});

export const updateColumnSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(1).max(50).optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const columnIdParamSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>["body"];
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>["body"];
