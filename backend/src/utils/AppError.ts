// Erro "operacional": algo previsível que queremos comunicar ao cliente
// com um status HTTP e mensagem específicos (ex: 404, 401, 409).
// Diferencia-se de erros de programação/bugs, que o error middleware
// trata como 500 genérico.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Não autorizado") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Acesso negado") {
    return new AppError(message, 403);
  }

  static notFound(message = "Recurso não encontrado") {
    return new AppError(message, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }
}
