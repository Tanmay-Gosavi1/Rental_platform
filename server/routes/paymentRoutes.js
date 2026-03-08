import express from 'express';
const router = express.Router();
import { createOrder, verifyPayment, getPaymentStatus, getAllPayments, webhookHandler } from '../controllers/paymentController.js';
import protect, { adminOnly } from '../middlewares/authMiddleware.js';

// Webhook (no auth required - signature verified separately)
router.post('/webhook', webhookHandler);

// Customer routes (protected)
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/status/:order_id', protect, getPaymentStatus);

// Admin routes
router.get('/admin/all', adminOnly, getAllPayments);

export default router;
