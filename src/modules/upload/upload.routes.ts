import { Router } from 'express';
import multer from 'multer';
import { ApiError } from '../../utils/ApiError';
import * as uploadController from './upload.controller';

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new ApiError(400, 'Only image files are allowed') as unknown as null, false);
  },
});

const documentUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, 'Only images or PDF are allowed') as unknown as null, false);
  },
});

const router = Router();

router.post('/image', imageUpload.single('file'), uploadController.uploadImage);
router.post('/document', documentUpload.single('file'), uploadController.uploadDocument);

export default router;
