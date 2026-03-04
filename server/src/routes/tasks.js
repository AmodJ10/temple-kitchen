import { Router } from 'express';
import * as ctrl from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/pending', ctrl.getAllPending);
router.get('/event/:eventId', ctrl.getByEvent);
router.post('/', authorize('engineer', 'admin'), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), ctrl.update);
router.patch('/:id/status', authorize('engineer', 'admin'), ctrl.updateStatus);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
