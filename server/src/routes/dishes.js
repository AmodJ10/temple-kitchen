import { Router } from 'express';
import * as ctrl from '../controllers/dishController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/event/:eventId', ctrl.getByEvent);
router.get('/event-day/:eventDayId', ctrl.getByEventDay);
router.post('/', authorize('engineer', 'admin'), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);
router.post('/reorder', authorize('engineer', 'admin'), ctrl.reorder);

export default router;
