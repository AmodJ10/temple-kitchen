import { Router } from 'express';
import * as ctrl from '../controllers/meetingController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { meetingSchema, meetingUpdateSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/event/:eventId', ctrl.getByEvent);
router.post('/', authorize('engineer', 'admin'), validate(meetingSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(meetingUpdateSchema), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
