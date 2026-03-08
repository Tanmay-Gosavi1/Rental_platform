import { getDB } from "../config/db.js";

export const findAllVehicles = async (filters = {}) => {
    const db = getDB();
    let query = 'SELECT * FROM Vehicles WHERE 1=1';
    const params = [];

    if (filters.type) {
        query += ' AND type = ?';
        params.push(filters.type);
    }
    if (filters.is_available !== undefined) {
        query += ' AND is_available = ?';
        params.push(filters.is_available);
    }
    if (filters.location) {
        query += ' AND location LIKE ?';
        params.push(`%${filters.location}%`);
    }
    if (filters.minPrice) {
        query += ' AND price_per_day >= ?';
        params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
        query += ' AND price_per_day <= ?';
        params.push(filters.maxPrice);
    }
    if (filters.brand) {
        query += ' AND brand LIKE ?';
        params.push(`%${filters.brand}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
}

export const findVehicleById = async (id) => {
    const db = getDB();
    const [rows] = await db.query('SELECT * FROM Vehicles WHERE vehicle_id = ?', [id]);
    return rows[0];
}

export const createVehicle = async (vehicleData) => {
    const db = getDB();
    const { name, brand, model, type, fuel_type, transmission, seats, price_per_day, price_per_hour, location, description, image_url, images, features } = vehicleData;
    
    const [result] = await db.query(
        `INSERT INTO Vehicles (name, brand, model, type, fuel_type, transmission, seats, price_per_day, price_per_hour, location, description, image_url, images, features) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, brand, model || name, type, fuel_type || 'petrol', transmission || 'manual', seats || 4, price_per_day, price_per_hour, location, description, image_url, JSON.stringify(images || []), JSON.stringify(features || [])]
    );
    return { vehicle_id: result.insertId, ...vehicleData };
}

export const updateVehicle = async (id, vehicleData) => {
    const db = getDB();
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'brand', 'model', 'type', 'fuel_type', 'transmission', 'seats', 'price_per_day', 'price_per_hour', 'location', 'description', 'image_url', 'images', 'features', 'is_available'];

    for (const field of allowedFields) {
        if (vehicleData[field] !== undefined) {
            fields.push(`${field} = ?`);
            if (field === 'images' || field === 'features') {
                values.push(JSON.stringify(vehicleData[field]));
            } else {
                values.push(vehicleData[field]);
            }
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await db.query(
        `UPDATE Vehicles SET ${fields.join(', ')} WHERE vehicle_id = ?`,
        values
    );
    return result.affectedRows > 0;
}

export const deleteVehicle = async (id) => {
    const db = getDB();
    const [result] = await db.query('DELETE FROM Vehicles WHERE vehicle_id = ?', [id]);
    return result.affectedRows > 0;
}

export const updateVehicleAvailability = async (id, isAvailable) => {
    const db = getDB();
    const [result] = await db.query(
        'UPDATE Vehicles SET is_available = ? WHERE vehicle_id = ?',
        [isAvailable, id]
    );
    return result.affectedRows > 0;
}

export const incrementVehicleTrips = async (id) => {
    const db = getDB();
    await db.query('UPDATE Vehicles SET total_trips = total_trips + 1 WHERE vehicle_id = ?', [id]);
}

export const updateVehicleRating = async (vehicleId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT AVG(rating) as avg_rating FROM Reviews WHERE vehicle_id = ?',
        [vehicleId]
    );
    if (rows[0].avg_rating) {
        await db.query(
            'UPDATE Vehicles SET rating = ? WHERE vehicle_id = ?',
            [rows[0].avg_rating, vehicleId]
        );
    }
}