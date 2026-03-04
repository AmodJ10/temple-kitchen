import { Router } from 'express';
import * as ctrl from '../controllers/inventoryUsedController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/event/:eventId', ctrl.getByEvent);
router.get('/event-day/:eventDayId', ctrl.getByEventDay);
router.post('/', authorize('engineer', 'admin'), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
