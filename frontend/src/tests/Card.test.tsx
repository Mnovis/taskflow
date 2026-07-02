import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { describe, expect, it, vi } from "vitest";
import { Card } from "@/components/board/Card";
import type { Card as CardType } from "@/types";

const baseCard: CardType = {
  id: "card-1",
  title: "Implementar autenticação",
  description: null,
  priority: "HIGH",
  dueDate: "2026-08-15T00:00:00.000Z",
  position: 0,
  columnId: "col-1",
  assigneeId: "user-1",
  assignee: {
    id: "user-1",
    name: "Ana Souza",
    email: "ana@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

// O componente Card usa useSortable (dnd-kit), que exige estar dentro
// de um DndContext para funcionar corretamente.
function renderCard(card: CardType, onClick = vi.fn()) {
  return render(
    <DndContext>
      <Card card={card} onClick={onClick} />
    </DndContext>
  );
}

describe("Card", () => {
  it("exibe título, prioridade e responsável", () => {
    renderCard(baseCard);

    expect(screen.getByText("Implementar autenticação")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  });

  it("não exibe bloco de responsável quando o card não tem assignee", () => {
    renderCard({ ...baseCard, assignee: null, assigneeId: null });
    expect(screen.queryByText("Ana Souza")).not.toBeInTheDocument();
  });

  it("chama onClick ao clicar no card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderCard(baseCard, onClick);

    await user.click(screen.getByText("Implementar autenticação"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
