import { getDB } from "../config/db.js";

export const createBooking = async (bookingData) => {
    const db = getDB();
    const { user_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, notes } = bookingData;
    
    const [result] = await db.query(
        `INSERT INTO Bookings (user_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_price, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location || pickup_location, total_price, notes]
    );
    return { booking_id: result.insertId, ...bookingData };
}

export const findBookingById = async (id) => {
    const db = getDB();
    const [rows] = await db.query(
        `SELECT b.*, b.total_price as total_amount, v.name as vehicle_name, v.brand, v.image_url as vehicle_image, v.type, u.username, u.email, u.phone
         FROM Bookings b 
         JOIN Vehicles v ON b.vehicle_id = v.vehicle_id 
         JOIN Users u ON b.user_id = u.user_id 
         WHERE b.booking_id = ?`,
        [id]
    );
    return rows[0];
}

export const findBookingsByUserId = async (userId) => {
    const db = getDB();
    const [rows] = await db.query(
        `SELECT b.*, b.total_price as total_amount, v.name as vehicle_name, v.brand, v.image_url as vehicle_image, v.type, v.price_per_day 
         FROM Bookings b 
         JOIN Vehicles v ON b.vehicle_id = v.vehicle_id 
         WHERE b.user_id = ? 
         ORDER BY b.created_at DESC`,
        [userId]
    );
    return rows;
}

export const findAllBookings = async (filters = {}) => {
    const db = getDB();
    let query = `SELECT b.*, v.name as vehicle_name, v.brand, v.image_url, v.type, u.username, u.email 
                 FROM Bookings b 
                 JOIN Vehicles v ON b.vehicle_id = v.vehicle_id 
                 JOIN Users u ON b.user_id = u.user_id 
                 WHERE 1=1`;
    const params = [];

    if (filters.status) {
        query += ' AND b.status = ?';
        params.push(filters.status);
    }
    if (filters.payment_status) {
        query += ' AND b.payment_status = ?';
        params.push(filters.payment_status);
    }

    query += ' ORDER BY b.created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
}

export const updateBookingStatus = async (id, status) => {
    const db = getDB();
    const [result] = await db.query(
        'UPDATE Bookings SET status = ? WHERE booking_id = ?',
        [status, id]
    );
    return result.affectedRows > 0;
}

export const updateBookingPaymentStatus = async (id, paymentStatus) => {
    const db = getDB();
    const [result] = await db.query(
        'UPDATE Bookings SET payment_status = ? WHERE booking_id = ?',
        [paymentStatus, id]
    );
    return result.affectedRows > 0;
}

export const cancelBooking = async (id) => {
    const db = getDB();
    const [result] = await db.query(
        'UPDATE Bookings SET status = "cancelled" WHERE booking_id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

export const checkVehicleAvailability = async (vehicleId, startDate, endDate, excludeBookingId = null) => {
    const db = getDB();
    let query = `SELECT COUNT(*) as count FROM Bookings 
                 WHERE vehicle_id = ? 
                 AND status NOT IN ('cancelled', 'completed')
                 AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))`;
    const params = [vehicleId, endDate, startDate, startDate, startDate, startDate, endDate];

    if (excludeBookingId) {
        query += ' AND booking_id != ?';
        params.push(excludeBookingId);
    }

    const [rows] = await db.query(query, params);
    return rows[0].count === 0;
}

// Dashboard stats for admin
export const getBookingStats = async () => {
    const db = getDB();
    
    const [totalBookings] = await db.query('SELECT COUNT(*) as count FROM Bookings');
    const [pendingBookings] = await db.query('SELECT COUNT(*) as count FROM Bookings WHERE status = "pending"');
    const [confirmedBookings] = await db.query('SELECT COUNT(*) as count FROM Bookings WHERE status = "confirmed"');
    const [completedBookings] = await db.query('SELECT COUNT(*) as count FROM Bookings WHERE status = "completed"');
    const [totalRevenue] = await db.query('SELECT SUM(total_price) as total FROM Bookings WHERE payment_status = "paid"');
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM Users WHERE role = "customer"');
    const [totalVehicles] = await db.query('SELECT COUNT(*) as count FROM Vehicles');
    
    const [recentBookings] = await db.query(
        `SELECT b.*, v.name as vehicle_name, u.username 
         FROM Bookings b 
         JOIN Vehicles v ON b.vehicle_id = v.vehicle_id 
         JOIN Users u ON b.user_id = u.user_id 
         ORDER BY b.created_at DESC LIMIT 5`
    );

    return {
        totalBookings: totalBookings[0].count,
        pendingBookings: pendingBookings[0].count,
        confirmedBookings: confirmedBookings[0].count,
        completedBookings: completedBookings[0].count,
        totalRevenue: totalRevenue[0].total || 0,
        totalUsers: totalUsers[0].count,
        totalVehicles: totalVehicles[0].count,
        recentBookings
    };
}
