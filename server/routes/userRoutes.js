import express from 'express';
import protect, { adminOnly } from '../middlewares/authMiddleware.js';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userControllers.js';
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin route
router.get('/admin/all', adminOnly, getAllUsers);

export default router;