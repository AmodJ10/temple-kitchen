import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/procurementController.js';
import { protect, authorize } from '../middleware/auth.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF allowed.'));
    },
});

const router = Router();

router.use(protect);
router.get('/event-day/:eventDayId', ctrl.getByEventDay);
router.get('/event/:eventId', ctrl.getByEvent);
router.post('/', authorize('engineer', 'admin'), ctrl.create);
router.put('/:id', authorize('engineer', 'admin'), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);
router.post('/:id/receipt', authorize('engineer', 'admin'), upload.single('receipt'), ctrl.uploadReceipt);

export default router;
