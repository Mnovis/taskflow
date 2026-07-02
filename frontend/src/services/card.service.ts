import { api } from "./api";
import type { Card, Priority } from "@/types";

export interface CardInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export const cardService = {
  async create(columnId: string, input: CardInput) {
    const { data } = await api.post<{ card: Card }>(`/columns/${columnId}/cards`, input);
    return data.card;
  },

  async update(cardId: string, input: Partial<CardInput>) {
    const { data } = await api.patch<{ card: Card }>(`/cards/${cardId}`, input);
    return data.card;
  },

  async delete(cardId: string) {
    await api.delete(`/cards/${cardId}`);
  },

  async move(cardId: string, targetColumnId: string, targetPosition: number) {
    const { data } = await api.patch<{ card: Card }>(`/cards/${cardId}/move`, {
      targetColumnId,
      targetPosition,
    });
    return data.card;
  },
};
