import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  addMemberSchema,
  updateMemberSchema,
  memberIdParamSchema,
  memberListQuerySchema,
} from './communityMember.validation';
import * as memberController from './communityMember.controller';

// auth + communityAuth are applied by the parent community router
const router = Router();

router.post('/', validate(addMemberSchema), memberController.addMember);
router.get('/', validate(memberListQuerySchema, 'query'), memberController.listMembers);
router.put(
  '/:memberId',
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberSchema),
  memberController.updateMember,
);
router.delete(
  '/:memberId',
  validate(memberIdParamSchema, 'params'),
  memberController.deleteMember,
);

export default router;
