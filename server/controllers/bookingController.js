import { createBooking, findBookingById, findBookingsByUserId, findAllBookings, updateBookingStatus, updateBookingPaymentStatus, cancelBooking, checkVehicleAvailability, getBookingStats } from '../services/bookingService.js';
import { findVehicleById, updateVehicleAvailability, incrementVehicleTrips } from '../services/vehicleService.js';

// Customer: Create new booking
export const createNewBooking = async (req, res) => {
    try {
        const { vehicle_id, start_date, end_date, pickup_location, dropoff_location, notes } = req.body;
        const user_id = req.user.id;

        if (!vehicle_id || !start_date || !end_date || !pickup_location) {
            return res.status(400).json({ success: false, message: 'Vehicle, start date, end date, and pickup location are required' });
        }

        // Check if vehicle exists
        const vehicle = await findVehicleById(vehicle_id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (!vehicle.is_available) {
            return res.status(400).json({ success: false, message: 'Vehicle is not available' });
        }

        // Check availability for the selected dates
        const isAvailable = await checkVehicleAvailability(vehicle_id, start_date, end_date);
        if (!isAvailable) {
            return res.status(400).json({ success: false, message: 'Vehicle is not available for the selected dates' });
        }

        // Calculate total price
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const diffTime = Math.abs(endDateObj - startDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const total_price = diffDays * parseFloat(vehicle.price_per_day);

        const booking = await createBooking({
            user_id,
            vehicle_id,
            start_date,
            end_date,
            pickup_location,
            dropoff_location,
            total_price,
            notes
        });

        return res.status(201).json({ 
            success: true, 
            message: 'Booking created successfully', 
            data: { ...booking, vehicle_name: vehicle.name, total_price }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error creating booking', error: error.message });
    }
}

// Customer: Get user's bookings
export const getUserBookings = async (req, res) => {
    try {
        const user_id = req.user.id;
        const bookings = await findBookingsByUserId(user_id);
        return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
    }
}

// Customer: Get single booking
export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await findBookingById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only allow user to see their own booking (unless admin)
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
    }
}

// Customer: Cancel booking
export const cancelUserBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await findBookingById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (booking.status === 'completed' || booking.status === 'ongoing') {
            return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
        }

        await cancelBooking(id);
        return res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
    }
}

// Admin: Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            payment_status: req.query.payment_status
        };
        const bookings = await findAllBookings(filters);
        return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching all bookings', error: error.message });
    }
}

// Admin: Update booking status
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await findBookingById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await updateBookingStatus(id, status);

        // If completed, increment vehicle trips
        if (status === 'completed') {
            await incrementVehicleTrips(booking.vehicle_id);
        }

        return res.status(200).json({ success: true, message: 'Booking status updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating booking status', error: error.message });
    }
}

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const stats = await getBookingStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
    }
}

// Check vehicle availability
export const checkAvailability = async (req, res) => {
    try {
        const { vehicle_id, start_date, end_date } = req.query;

        if (!vehicle_id || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Vehicle ID, start date, and end date are required' });
        }

        const isAvailable = await checkVehicleAvailability(vehicle_id, start_date, end_date);
        return res.status(200).json({ success: true, available: isAvailable });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error checking availability', error: error.message });
    }
}
