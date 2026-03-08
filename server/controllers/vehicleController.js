import { findAllVehicles, findVehicleById, createVehicle, updateVehicle, deleteVehicle, updateVehicleAvailability } from '../services/vehicleService.js';

export const getAllVehicles = async (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            location: req.query.location,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            brand: req.query.brand,
            is_available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined
        };
        const vehicles = await findAllVehicles(filters);
        return res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching all vehicles', error: error.message });
    }
}

export const getVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await findVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        return res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching single vehicle', error: error.message });
    }
}

// Admin: Create vehicle
export const addVehicle = async (req, res) => {
    try {
        const { name, brand, model, type, fuel_type, transmission, seats, price_per_day, price_per_hour, location, description, image_url, images, features } = req.body;

        if (!name || !brand || !type || !price_per_day || !location) {
            return res.status(400).json({ success: false, message: 'Name, brand, type, price_per_day, and location are required' });
        }

        const vehicle = await createVehicle({
            name, brand, model, type, fuel_type, transmission, seats,
            price_per_day, price_per_hour, location, description, image_url, images, features
        });

        return res.status(201).json({ success: true, message: 'Vehicle created successfully', data: vehicle });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error creating vehicle', error: error.message });
    }
}

// Admin: Update vehicle
export const editVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicleData = req.body;

        const existingVehicle = await findVehicleById(id);
        if (!existingVehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        const updated = await updateVehicle(id, vehicleData);
        if (!updated) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        const updatedVehicle = await findVehicleById(id);
        return res.status(200).json({ success: true, message: 'Vehicle updated successfully', data: updatedVehicle });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating vehicle', error: error.message });
    }
}

// Admin: Delete vehicle
export const removeVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const existingVehicle = await findVehicleById(id);
        if (!existingVehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        await deleteVehicle(id);
        return res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error deleting vehicle', error: error.message });
    }
}

// Admin: Toggle availability
export const toggleVehicleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;

        const existingVehicle = await findVehicleById(id);
        if (!existingVehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        await updateVehicleAvailability(id, is_available);
        return res.status(200).json({ success: true, message: `Vehicle ${is_available ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating availability', error: error.message });
    }
}