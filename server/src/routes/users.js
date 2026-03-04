import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('engineer', 'admin'));

router.get('/', ctrl.getAll);
router.put('/:id/role', ctrl.updateRole);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
