import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import protect from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/bookings', protect, bookingRoutes);
router.use('/vehicles', vehicleRoutes); // Some routes are public, some protected
router.use('/payments', paymentRoutes);

export default router;