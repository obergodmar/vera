import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { TOKEN } = process.env;
    if (!TOKEN) {
      throw Error('TOKEN is empty');
    }

    const { body } = req;

    if (body?.token !== TOKEN) {
      res.status(401).send('Token is missing or invalid');

      return;
    }

    next();
  }
}
