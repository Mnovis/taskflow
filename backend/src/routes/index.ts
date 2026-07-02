import { Router } from "express";
import authRoutes from "./auth.routes";
import boardRoutes from "./board.routes";
import { boardColumnRouter, columnRouter } from "./column.routes";
import { columnCardRouter, cardRouter } from "./card.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);

// Aninhado: criar coluna dentro de um board específico
router.use("/boards/:boardId/columns", boardColumnRouter);
// Independente: atualizar/excluir coluna por id
router.use("/columns", columnRouter);

// Aninhado: criar card dentro de uma coluna específica
router.use("/columns/:columnId/cards", columnCardRouter);
// Independente: atualizar/excluir/mover card por id
router.use("/cards", cardRouter);

export default router;
