import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export interface RequestSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.params)
        request.params = schemas.params.parse(request.params) as typeof request.params;
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.body) request.body = schemas.body.parse(request.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
