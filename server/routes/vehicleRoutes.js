import express from 'express';
const router = express.Router();
import { getAllVehicles, getVehicle, addVehicle, editVehicle, removeVehicle, toggleVehicleAvailability } from '../controllers/vehicleController.js';
import { adminOnly } from '../middlewares/authMiddleware.js';

// Public routes (protected by auth)
router.get('/', getAllVehicles);
router.get('/:id', getVehicle);

// Admin only routes
router.post('/', adminOnly, addVehicle);
router.put('/:id', adminOnly, editVehicle);
router.delete('/:id', adminOnly, removeVehicle);
router.patch('/:id/availability', adminOnly, toggleVehicleAvailability);

export default router;