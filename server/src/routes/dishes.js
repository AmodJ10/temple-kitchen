import { Router } from 'express';
import * as ctrl from '../controllers/dishController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { dishReorderSchema, dishSchema, dishUpdateSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/event/:eventId', ctrl.getByEvent);
router.get('/event-day/:eventDayId', ctrl.getByEventDay);
router.post('/', authorize('engineer', 'admin'), validate(dishSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(dishUpdateSchema), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);
router.post('/reorder', authorize('engineer', 'admin'), validate(dishReorderSchema), ctrl.reorder);

export default router;
