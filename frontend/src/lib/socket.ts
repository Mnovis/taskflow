import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Cria (ou reutiliza) a conexão de socket autenticada com o access
// token atual. Chamado pelo hook useBoardSocket ao entrar numa tela de board.
export function getSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: accessToken },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
