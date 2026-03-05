import { Router } from 'express';
import * as ctrl from '../controllers/sevekariController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { sevekariSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('engineer', 'admin'), validate(sevekariSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(sevekariSchema), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);
router.delete('/hard/:id', authorize('engineer', 'admin'), ctrl.hardDelete);

export default router;
