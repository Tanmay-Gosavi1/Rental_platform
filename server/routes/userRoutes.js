import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { getProfile } from '../controllers/userControllers.js';
const router = express.Router();

router.get('/profile' , protect , getProfile)

export default router;