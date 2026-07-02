import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createCardSchema = z.object({
  params: z.object({ columnId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(1, "Título é obrigatório").max(120),
    description: z.string().trim().max(2000).optional(),
    priority: priorityEnum.optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
  }),
});

export const updateCardSchema = z.object({
  params: z.object({ cardId: z.string().uuid() }),
  body: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    priority: priorityEnum.optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
  }),
});

// Mover card: nova coluna de destino + nova posição dentro dela.
// Usado pelo drag-and-drop no frontend.
export const moveCardSchema = z.object({
  params: z.object({ cardId: z.string().uuid() }),
  body: z.object({
    targetColumnId: z.string().uuid(),
    targetPosition: z.number().int().min(0),
  }),
});

export const cardIdParamSchema = z.object({
  params: z.object({ cardId: z.string().uuid() }),
});

export type CreateCardInput = z.infer<typeof createCardSchema>["body"];
export type UpdateCardInput = z.infer<typeof updateCardSchema>["body"];
export type MoveCardInput = z.infer<typeof moveCardSchema>["body"];
