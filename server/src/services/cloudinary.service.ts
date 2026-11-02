import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

export async function uploadImages(files: Express.Multer.File[]): Promise<string[]> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
    throw new AppError(503, 'IMAGE_UPLOAD_UNAVAILABLE', 'Image uploads are not configured');
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'eventora/services', resource_type: 'image' },
            (error, result) =>
              error || !result
                ? reject(new AppError(502, 'IMAGE_UPLOAD_FAILED', 'An image could not be uploaded'))
                : resolve(result.secure_url),
          );
          stream.end(file.buffer);
        }),
    ),
  );
}
