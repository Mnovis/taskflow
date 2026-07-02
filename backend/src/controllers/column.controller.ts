import { Request, Response, NextFunction } from "express";
import { columnService } from "../services/column.service";
import { emitToBoard, SOCKET_EVENTS } from "../sockets";

export const columnController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnService.create(req.params.boardId, req.body, req.user!.id);
      emitToBoard(req.params.boardId, SOCKET_EVENTS.COLUMN_CREATED, column);
      res.status(201).json({ column });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnService.update(req.params.columnId, req.body, req.user!.id);
      emitToBoard(column.boardId, SOCKET_EVENTS.COLUMN_UPDATED, column);
      res.status(200).json({ column });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnService.findOrThrow(req.params.columnId);
      await columnService.delete(req.params.columnId, req.user!.id);
      emitToBoard(column.boardId, SOCKET_EVENTS.COLUMN_DELETED, { id: column.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
