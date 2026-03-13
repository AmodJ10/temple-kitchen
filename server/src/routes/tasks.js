import { Router } from 'express';
import * as ctrl from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { taskReorderSchema, taskSchema, taskStatusUpdateSchema, taskUpdateSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/pending', ctrl.getAllPending);
router.get('/event/:eventId', ctrl.getByEvent);
router.post('/reorder', authorize('engineer', 'admin'), validate(taskReorderSchema), ctrl.reorder);
router.post('/', authorize('engineer', 'admin'), validate(taskSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(taskUpdateSchema), ctrl.update);
router.patch('/:id/status', authorize('engineer', 'admin'), validate(taskStatusUpdateSchema), ctrl.updateStatus);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
