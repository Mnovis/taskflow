import request from "supertest";
import { app } from "../src/app";
import { resetDatabase, disconnectDatabase } from "./helpers/db";

async function registerAndLogin(email: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Usuário Teste", email, password: "senha123" });
  return res.body.accessToken as string;
}

describe("Board routes", () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    token = await registerAndLogin("owner@example.com");
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("rejeita criação de board sem autenticação", async () => {
    const res = await request(app).post("/api/boards").send({ title: "Board sem auth" });
    expect(res.status).toBe(401);
  });

  it("cria um board e o retorna com o criador como OWNER", async () => {
    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Projeto Portfólio", description: "Board de testes" });

    expect(res.status).toBe(201);
    expect(res.body.board.title).toBe("Projeto Portfólio");
    expect(res.body.board.members).toHaveLength(1);
    expect(res.body.board.members[0].role).toBe("OWNER");
  });

  it("lista apenas os boards do usuário autenticado", async () => {
    await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Board A" });

    const outroToken = await registerAndLogin("outro@example.com");
    await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${outroToken}`)
      .send({ title: "Board B" });

    const res = await request(app).get("/api/boards").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.boards).toHaveLength(1);
    expect(res.body.boards[0].title).toBe("Board A");
  });

  it("impede que um não-membro acesse um board", async () => {
    const createRes = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Board Privado" });

    const outroToken = await registerAndLogin("intruso@example.com");
    const res = await request(app)
      .get(`/api/boards/${createRes.body.board.id}`)
      .set("Authorization", `Bearer ${outroToken}`);

    expect(res.status).toBe(403);
  });

  it("adiciona um colaborador existente pelo e-mail", async () => {
    const createRes = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Board Colaborativo" });

    await registerAndLogin("colaborador@example.com");

    const res = await request(app)
      .post(`/api/boards/${createRes.body.board.id}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "colaborador@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.member.user.email).toBe("colaborador@example.com");
  });

  it("rejeita convite de e-mail não cadastrado", async () => {
    const createRes = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Board Colaborativo" });

    const res = await request(app)
      .post(`/api/boards/${createRes.body.board.id}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "naoexiste@example.com" });

    expect(res.status).toBe(404);
  });
});
