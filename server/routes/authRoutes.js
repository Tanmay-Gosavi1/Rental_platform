import express from 'express';
import {login , sendRegistrationOtp , verifyRegistrationOtp , logout , sendResetPasswordOtp , resetPassword} from '../controllers/authController.js';
import protect from '../middlewares/authMiddleware.js';
import { googleAuth } from '../controllers/googleAuthController.js'; 
const router = express.Router();

router.post('/login', login);
router.post('/send-otp', sendRegistrationOtp);
router.post('/verify-otp', verifyRegistrationOtp);
router.post('/logout', protect, logout);
router.post('/send-reset-password-otp', sendResetPasswordOtp);
router.post('/reset-password', resetPassword);

router.post('/google', googleAuth);

export default router;