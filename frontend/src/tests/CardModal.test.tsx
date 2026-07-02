import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardModal } from "@/components/board/CardModal";
import type { Card, BoardMember } from "@/types";

const card: Card = {
  id: "card-1",
  title: "Escrever README",
  description: "",
  priority: "MEDIUM",
  dueDate: null,
  position: 0,
  columnId: "col-1",
  assigneeId: null,
  assignee: null,
};

const members: BoardMember[] = [
  {
    id: "m1",
    role: "OWNER",
    userId: "user-1",
    user: {
      id: "user-1",
      name: "Ana Souza",
      email: "ana@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
];

describe("CardModal", () => {
  it("preenche o formulário com os dados do card recebido", () => {
    render(
      <CardModal card={card} members={members} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByDisplayValue("Escrever README")).toBeInTheDocument();
  });

  it("chama onSave com os dados editados ao clicar em Salvar", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <CardModal card={card} members={members} onClose={onClose} onSave={onSave} onDelete={vi.fn()} />
    );

    const titleInput = screen.getByDisplayValue("Escrever README");
    await user.clear(titleInput);
    await user.type(titleInput, "Escrever README completo");

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSave).toHaveBeenCalledWith(
      "card-1",
      expect.objectContaining({ title: "Escrever README completo" })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("chama onDelete ao clicar em Excluir tarefa", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <CardModal card={card} members={members} onClose={vi.fn()} onSave={vi.fn()} onDelete={onDelete} />
    );

    await user.click(screen.getByRole("button", { name: /excluir tarefa/i }));
    expect(onDelete).toHaveBeenCalledWith("card-1");
  });
});
