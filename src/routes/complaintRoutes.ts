import { Router } from 'express';
import { 
    createComplaint, 
    getMyComplaints, 
    getAllComplaints, 
    updateComplaintStatus,
    respondToComplaint
} from '../controllers/complaintController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public route for guest complaints
router.post('/public', createComplaint);

router.use(protect);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);

router.get('/all', authorize(UserRole.ADMIN, UserRole.SUPPORT), getAllComplaints);
router.patch('/:id/status', authorize(UserRole.ADMIN, UserRole.SUPPORT), updateComplaintStatus);
router.post('/:id/respond', respondToComplaint);

export default router;
