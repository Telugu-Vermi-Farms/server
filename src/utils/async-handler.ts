import { Request, Response, NextFunction, RequestHandler } from 'express';
import HttpStatusCodes from './HTTP_STATUS_CODES';

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let response = await fn(req, res, next);
      res.status(response.statusCode || 200).json(response).end();
    } catch (error: any) {
      console.error('Caught error in asyncHandler:', error);
      res.status(error.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR).json(error).end();
      next(error);
    }
  };
};

export default asyncHandler;
