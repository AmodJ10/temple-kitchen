import { Router } from 'express';
import * as ctrl from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { vendorSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('engineer', 'admin'), validate(vendorSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(vendorSchema), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
