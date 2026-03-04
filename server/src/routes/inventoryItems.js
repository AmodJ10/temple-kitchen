import { Router } from 'express';
import * as ctrl from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { inventoryItemSchema, stockAdjustmentSchema } from '../../../shared/index.js';

const router = Router();

router.use(protect);
router.get('/low-stock', ctrl.getLowStock);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/transactions', ctrl.getTransactions);
router.post('/', authorize('engineer', 'admin'), validate(inventoryItemSchema), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), validate(inventoryItemSchema), ctrl.update);
router.post('/:id/adjust', authorize('engineer', 'admin'), validate(stockAdjustmentSchema), ctrl.adjustStockHandler);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
