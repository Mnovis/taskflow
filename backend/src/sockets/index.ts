import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { boardService } from "../services/board.service";

let io: Server | undefined;

// Eventos emitidos pelo servidor para os clientes conectados a um board.
// Mantidos centralizados aqui para facilitar consistência entre
// backend e frontend (o frontend usa os mesmos nomes de evento).
export const SOCKET_EVENTS = {
  COLUMN_CREATED: "column:created",
  COLUMN_UPDATED: "column:updated",
  COLUMN_DELETED: "column:deleted",
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_MOVED: "card:moved",
  CARD_DELETED: "card:deleted",
} as const;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // Autentica a conexão de socket usando o mesmo access token JWT
  // usado nas requisições HTTP, enviado no handshake.
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Token de autenticação ausente"));

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Token de autenticação inválido"));
    }
  });

  io.on("connection", (socket: Socket) => {
    // Cliente entra na "sala" do board que está visualizando.
    // Só usuários com acesso ao board podem entrar na sala dele.
    socket.on("board:join", async (boardId: string) => {
      try {
        await boardService.assertMembership(boardId, socket.data.userId);
        socket.join(roomName(boardId));
      } catch {
        socket.emit("error", "Acesso negado a este board");
      }
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(roomName(boardId));
    });
  });

  return io;
}

function roomName(boardId: string) {
  return `board:${boardId}`;
}

// Emite um evento para todos os clientes conectados a um board,
// exceto (opcionalmente) o próprio autor da mudança.
export function emitToBoard(
  boardId: string,
  event: string,
  payload: unknown,
  excludeSocketId?: string
) {
  if (!io) return;
  const emitter = excludeSocketId
    ? io.to(roomName(boardId)).except(excludeSocketId)
    : io.to(roomName(boardId));
  emitter.emit(event, payload);
}
