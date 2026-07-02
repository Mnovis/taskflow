// Estende o tipo Request do Express para incluir o usuário autenticado,
// anexado pelo auth.middleware após validar o access token.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}
