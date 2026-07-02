import request from "supertest";
import { app } from "../src/app";
import { resetDatabase, disconnectDatabase } from "./helpers/db";

async function setupBoardWithColumn(email: string) {
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ name: "Usuário Teste", email, password: "senha123" });
  const token = registerRes.body.accessToken as string;

  const boardRes = await request(app)
    .post("/api/boards")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Board de Cards" });
  const boardId = boardRes.body.board.id as string;

  const columnRes = await request(app)
    .post(`/api/boards/${boardId}/columns`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "A Fazer" });
  const columnId = columnRes.body.column.id as string;

  return { token, boardId, columnId };
}

describe("Card routes", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("cria um card dentro de uma coluna com valores padrão", async () => {
    const { token, columnId } = await setupBoardWithColumn("dev@example.com");

    const res = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Implementar autenticação" });

    expect(res.status).toBe(201);
    expect(res.body.card).toMatchObject({
      title: "Implementar autenticação",
      priority: "MEDIUM",
      position: 0,
    });
  });

  it("rejeita criação de card com título vazio", async () => {
    const { token, columnId } = await setupBoardWithColumn("dev2@example.com");

    const res = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("move um card para outra coluna e reordena posições", async () => {
    const { token, boardId, columnId } = await setupBoardWithColumn("dev3@example.com");

    // segunda coluna de destino
    const columnRes2 = await request(app)
      .post(`/api/boards/${boardId}/columns`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Em Progresso" });
    const columnId2 = columnRes2.body.column.id as string;

    const cardRes = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tarefa a mover" });
    const cardId = cardRes.body.card.id as string;

    const moveRes = await request(app)
      .patch(`/api/cards/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ targetColumnId: columnId2, targetPosition: 0 });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.card.columnId).toBe(columnId2);
    expect(moveRes.body.card.position).toBe(0);
  });

  it("impede que um usuário sem acesso ao board crie cards", async () => {
    const { columnId } = await setupBoardWithColumn("dono@example.com");

    const outroRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Estranho", email: "estranho@example.com", password: "senha123" });
    const outroToken = outroRes.body.accessToken as string;

    const res = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${outroToken}`)
      .send({ title: "Card intruso" });

    expect(res.status).toBe(403);
  });
});
