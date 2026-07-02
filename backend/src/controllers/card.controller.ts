import { Request, Response, NextFunction } from "express";
import { cardService } from "../services/card.service";
import { emitToBoard, SOCKET_EVENTS } from "../sockets";

export const cardController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardService.create(req.params.columnId, req.body, req.user!.id);
      const boardId = (await cardService.findOrThrow(card.id)).column.boardId;
      emitToBoard(boardId, SOCKET_EVENTS.CARD_CREATED, card);
      res.status(201).json({ card });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await cardService.findOrThrow(req.params.cardId);
      const card = await cardService.update(req.params.cardId, req.body, req.user!.id);
      emitToBoard(existing.column.boardId, SOCKET_EVENTS.CARD_UPDATED, card);
      res.status(200).json({ card });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await cardService.findOrThrow(req.params.cardId);
      await cardService.delete(req.params.cardId, req.user!.id);
      emitToBoard(existing.column.boardId, SOCKET_EVENTS.CARD_DELETED, { id: existing.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async move(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await cardService.findOrThrow(req.params.cardId);
      const card = await cardService.move(req.params.cardId, req.body, req.user!.id);
      emitToBoard(existing.column.boardId, SOCKET_EVENTS.CARD_MOVED, card);
      res.status(200).json({ card });
    } catch (error) {
      next(error);
    }
  },
};
