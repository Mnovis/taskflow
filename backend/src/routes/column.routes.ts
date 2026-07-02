import { Router } from "express";
import { columnController } from "../controllers/column.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createColumnSchema,
  updateColumnSchema,
  columnIdParamSchema,
} from "../schemas/column.schema";

// Rotas aninhadas sob /boards/:boardId/columns
export const boardColumnRouter = Router({ mergeParams: true });
boardColumnRouter.use(authMiddleware);
boardColumnRouter.post("/", validate(createColumnSchema), columnController.create);

// Rotas independentes /columns/:columnId (update/delete não precisam do boardId na URL)
export const columnRouter = Router();
columnRouter.use(authMiddleware);
columnRouter.patch("/:columnId", validate(updateColumnSchema), columnController.update);
columnRouter.delete("/:columnId", validate(columnIdParamSchema), columnController.delete);
