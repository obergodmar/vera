import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { body } = req;

    if (
      body?.token !==
      'REMOVED_AUTH_TOKEN'
    ) {
      res.status(401).send('Token is missing or invalid');

      return;
    }

    next();
  }
}
