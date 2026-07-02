import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./sockets";

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
  console.log(`🔌 Socket.io pronto para conexões`);
});
