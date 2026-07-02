import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "@/pages/LoginPage";

// Mocka o hook useAuth para isolar o teste da camada de UI, sem
// depender de chamadas HTTP reais.
const loginMock = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    error: null,
    isSubmitting: false,
  }),
}));

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("renderiza os campos de e-mail e senha", () => {
    renderLoginPage();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("mostra erros de validação e não chama login com e-mail inválido", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), "email-invalido");
    await user.type(screen.getByLabelText(/senha/i), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("chama login com dados válidos do formulário", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), "ana@example.com");
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(loginMock).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "senha123",
    });
  });
});
