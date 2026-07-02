import { api } from "./api";
import type { Board, BoardDetail, Column } from "@/types";

export const boardService = {
  async list() {
    const { data } = await api.get<{ boards: Board[] }>("/boards");
    return data.boards;
  },

  async getById(boardId: string) {
    const { data } = await api.get<{ board: BoardDetail }>(`/boards/${boardId}`);
    return data.board;
  },

  async create(input: { title: string; description?: string }) {
    const { data } = await api.post<{ board: Board }>("/boards", input);
    return data.board;
  },

  async update(boardId: string, input: { title?: string; description?: string }) {
    const { data } = await api.patch<{ board: Board }>(`/boards/${boardId}`, input);
    return data.board;
  },

  async delete(boardId: string) {
    await api.delete(`/boards/${boardId}`);
  },

  async addMember(boardId: string, email: string) {
    const { data } = await api.post(`/boards/${boardId}/members`, { email });
    return data.member;
  },

  async createColumn(boardId: string, title: string) {
    const { data } = await api.post<{ column: Column }>(`/boards/${boardId}/columns`, { title });
    return data.column;
  },

  async updateColumn(columnId: string, input: { title?: string; position?: number }) {
    const { data } = await api.patch<{ column: Column }>(`/columns/${columnId}`, input);
    return data.column;
  },

  async deleteColumn(columnId: string) {
    await api.delete(`/columns/${columnId}`);
  },
};
