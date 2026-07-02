import { Request, Response, NextFunction } from "express";
import { boardService } from "../services/board.service";

export const boardController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const boards = await boardService.listForUser(req.user!.id);
      res.status(200).json({ boards });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.getById(req.params.boardId, req.user!.id);
      res.status(200).json({ board });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.create(req.body, req.user!.id);
      res.status(201).json({ board });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.update(req.params.boardId, req.body, req.user!.id);
      res.status(200).json({ board });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await boardService.delete(req.params.boardId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await boardService.addMember(
        req.params.boardId,
        req.body.email,
        req.user!.id
      );
      res.status(201).json({ member });
    } catch (error) {
      next(error);
    }
  },
};
