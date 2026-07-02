import request from "supertest";
import { app } from "../src/app";
import { resetDatabase, disconnectDatabase } from "./helpers/db";

describe("Auth routes", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  const validUser = {
    name: "Ana Souza",
    email: "ana@example.com",
    password: "senha123",
  };

  describe("POST /api/auth/register", () => {
    it("cria um novo usuário e retorna access token + dados públicos", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        name: validUser.name,
        email: validUser.email,
      });
      expect(res.body.user.passwordHash).toBeUndefined();

      // refresh token deve vir como cookie httpOnly, não no corpo
      const cookies = res.headers["set-cookie"];
      expect(cookies?.[0]).toMatch(/refreshToken=/);
      expect(cookies?.[0]).toMatch(/HttpOnly/i);
    });

    it("rejeita registro com e-mail duplicado", async () => {
      await request(app).post("/api/auth/register").send(validUser);
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/já existe/i);
    });

    it("rejeita payload inválido (senha curta)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, password: "123" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("autentica com credenciais corretas", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it("rejeita senha incorreta", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "senhaerrada" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("rejeita acesso sem token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("retorna o perfil do usuário autenticado", async () => {
      const registerRes = await request(app).post("/api/auth/register").send(validUser);
      const token = registerRes.body.accessToken;

      const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });
  });
});
