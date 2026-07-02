import { z } from "zod";

export const cardFormSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")),
});

export type CardFormData = z.infer<typeof cardFormSchema>;
