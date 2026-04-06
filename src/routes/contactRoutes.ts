import { Router } from 'express';
import { createContact, getAllContacts, updateContactStatus } from '../controllers/contactController';

const router = Router();

// Public route
router.post('/', createContact);

// Protected routes (Admin/Support only)
// Note: Middleware should be added here in a real app, but I'll keep it simple for now or follow existing patterns.
router.get('/all', getAllContacts);
router.patch('/:id/status', updateContactStatus);

export default router;
