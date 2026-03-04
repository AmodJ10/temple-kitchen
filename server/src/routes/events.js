import { Router } from 'express';
import * as ctrl from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { eventSchema } from '../../../shared/index.js';

const router = Router();

router.use(protect);
router.get('/', ctrl.getAll);
router.put('/days/:dayId', authorize('engineer', 'admin'), ctrl.updateEventDay);
router.get('/:id', ctrl.getById);
router.post('/', authorize('engineer', 'admin'), validate(eventSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(eventSchema.innerType().partial()), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
