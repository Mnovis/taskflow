export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type BoardRole = "OWNER" | "MEMBER";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface BoardMember {
  id: string;
  role: BoardRole;
  userId: string;
  user: User;
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: BoardMember[];
  _count?: { columns: number };
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  position: number;
  columnId: string;
  assigneeId: string | null;
  assignee: User | null;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

// Board com colunas e cards aninhados (retorno de GET /boards/:id)
export interface BoardDetail extends Board {
  columns: Column[];
}
