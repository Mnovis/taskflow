import { Router } from "express";
import { cardController } from "../controllers/card.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  cardIdParamSchema,
} from "../schemas/card.schema";

// Rotas aninhadas sob /columns/:columnId/cards
export const columnCardRouter = Router({ mergeParams: true });
columnCardRouter.use(authMiddleware);
columnCardRouter.post("/", validate(createCardSchema), cardController.create);

// Rotas independentes /cards/:cardId
export const cardRouter = Router();
cardRouter.use(authMiddleware);
cardRouter.patch("/:cardId", validate(updateCardSchema), cardController.update);
cardRouter.delete("/:cardId", validate(cardIdParamSchema), cardController.delete);
cardRouter.patch("/:cardId/move", validate(moveCardSchema), cardController.move);
