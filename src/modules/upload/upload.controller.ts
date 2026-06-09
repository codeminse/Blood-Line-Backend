import type { Request, Response } from 'express';
import { cloudinary } from '../../config/cloudinary';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import { ApiError } from '../../utils/ApiError';
import type { UploadApiResponse } from 'cloudinary';

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto',
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'] },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve(result);
      },
    );
    stream.end(buffer);
  });

export const uploadImage = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const result = await uploadToCloudinary(req.file.buffer, 'feni-blood-line/community-logos', 'image');

  sendSuccess(res, 200, 'Image uploaded successfully', {
    url: result.secure_url,
    publicId: result.public_id,
  });
});

export const uploadDocument = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
  const result = await uploadToCloudinary(req.file.buffer, 'feni-blood-line/community-docs', resourceType);

  sendSuccess(res, 200, 'Document uploaded successfully', {
    url: result.secure_url,
    publicId: result.public_id,
  });
});
