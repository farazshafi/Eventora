import type { Request, Response } from 'express';
import type { ServiceService } from '../services/service.service.js';
import { sendSuccess } from '../utils/response.js';
import { uploadImages } from '../services/cloudinary.service.js';

export class ServiceController {
  constructor(private readonly services: ServiceService) {}
  uploadImages = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(
      response,
      { images: await uploadImages((request.files as Express.Multer.File[]) ?? []) },
      201,
    );
  create = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.services.create(request.body, request.auth!.sub), 201);
  browse = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.services.browse(request.validatedQuery as never));
  get = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.services.get(String(request.params.id)));
  update = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(
      response,
      await this.services.update(String(request.params.id), request.auth!.sub, request.body),
    );
  delete = async (request: Request, response: Response): Promise<void> => {
    await this.services.delete(String(request.params.id), request.auth!.sub);
    sendSuccess(response, { message: 'Service deleted successfully' });
  };
  mine = async (request: Request, response: Response): Promise<void> => {
    const pagination = request.validatedQuery as {
      page: number;
      limit: number;
      search?: string;
      category?: import('../types/service.types.js').ServiceCategory;
    };
    sendSuccess(
      response,
      await this.services.mine(request.auth!.sub, pagination.page, pagination.limit, {
        ...(pagination.search ? { search: pagination.search } : {}),
        ...(pagination.category ? { category: pagination.category } : {}),
      }),
    );
  };
}
