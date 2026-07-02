import { Router } from "express";
import { boardController } from "../controllers/board.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
  addMemberSchema,
} from "../schemas/board.schema";

const router = Router();

router.use(authMiddleware); // todas as rotas de board exigem autenticação

router.get("/", boardController.list);
router.post("/", validate(createBoardSchema), boardController.create);
router.get("/:boardId", validate(boardIdParamSchema), boardController.getById);
router.patch("/:boardId", validate(updateBoardSchema), boardController.update);
router.delete("/:boardId", validate(boardIdParamSchema), boardController.delete);
router.post("/:boardId/members", validate(addMemberSchema), boardController.addMember);

export default router;
