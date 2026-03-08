import express from 'express';
const router = express.Router();
import { createNewBooking, getUserBookings, getBooking, cancelUserBooking, getAllBookings, updateStatus, getDashboardStats, checkAvailability } from '../controllers/bookingController.js';
import { adminOnly } from '../middlewares/authMiddleware.js';

// Customer routes
router.post('/', createNewBooking);
router.get('/my', getUserBookings);
router.get('/check-availability', checkAvailability);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelUserBooking);

// Admin routes
router.get('/admin/all', adminOnly, getAllBookings);
router.get('/admin/stats', adminOnly, getDashboardStats);
router.patch('/admin/:id/status', adminOnly, updateStatus);

export default router;