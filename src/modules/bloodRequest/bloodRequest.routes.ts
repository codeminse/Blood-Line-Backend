import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  createBloodRequestSchema,
  updateRequestStatusSchema,
  listRequestsQuerySchema,
  requestIdParamSchema,
} from './bloodRequest.validation';
import * as bloodRequestController from './bloodRequest.controller';

const router = Router();

router.post('/', validate(createBloodRequestSchema), bloodRequestController.createRequest);

router.get(
  '/',
  validate(listRequestsQuerySchema, 'query'),
  bloodRequestController.listRequests,
);

router.get(
  '/:id',
  validate(requestIdParamSchema, 'params'),
  bloodRequestController.getRequestById,
);

router.patch(
  '/:id/status',
  validate(requestIdParamSchema, 'params'),
  validate(updateRequestStatusSchema),
  bloodRequestController.updateRequestStatus,
);

export default router;
