import { Router } from 'express';
import * as ctrl from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { attendanceBulkSchema, attendanceSchema, attendanceUpdateSchema } from '../schemas.js';

const router = Router();

router.use(protect);
router.get('/event/:eventId', ctrl.getByEvent);
router.get('/event-day/:eventDayId', ctrl.getByEventDay);
router.post('/', authorize('engineer', 'admin'), validate(attendanceSchema), ctrl.create);
router.post('/bulk', authorize('engineer', 'admin'), validate(attendanceBulkSchema), ctrl.bulkCreate);
router.put('/:id', authorize('engineer', 'admin'), validate(attendanceUpdateSchema), ctrl.update);
router.delete('/:id', authorize('engineer', 'admin'), ctrl.remove);

export default router;
