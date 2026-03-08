import { getDB } from "../config/db.js";

export const createPayment = async (paymentData) => {
    const db = getDB();
    const { booking_id, user_id, razorpay_order_id, amount, currency } = paymentData;
    
    const [result] = await db.query(
        `INSERT INTO Payments (booking_id, user_id, razorpay_order_id, amount, currency, status) 
         VALUES (?, ?, ?, ?, ?, 'created')`,
        [booking_id, user_id, razorpay_order_id, amount, currency || 'INR']
    );
    return { payment_id: result.insertId, ...paymentData };
}

export const findPaymentByOrderId = async (orderId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT * FROM Payments WHERE razorpay_order_id = ?',
        [orderId]
    );
    return rows[0];
}

export const findPaymentByBookingId = async (bookingId) => {
    const db = getDB();
    const [rows] = await db.query(
        'SELECT * FROM Payments WHERE booking_id = ?',
        [bookingId]
    );
    return rows[0];
}

export const updatePaymentSuccess = async (orderId, paymentId, signature) => {
    const db = getDB();
    const [result] = await db.query(
        `UPDATE Payments 
         SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'captured', payment_date = NOW() 
         WHERE razorpay_order_id = ?`,
        [paymentId, signature, orderId]
    );
    return result.affectedRows > 0;
}

export const updatePaymentFailed = async (orderId) => {
    const db = getDB();
    const [result] = await db.query(
        'UPDATE Payments SET status = "failed" WHERE razorpay_order_id = ?',
        [orderId]
    );
    return result.affectedRows > 0;
}

export const findAllPayments = async () => {
    const db = getDB();
    const [rows] = await db.query(
        `SELECT p.*, b.start_date, b.end_date, v.name as vehicle_name, u.username, u.email 
         FROM Payments p 
         JOIN Bookings b ON p.booking_id = b.booking_id 
         JOIN Vehicles v ON b.vehicle_id = v.vehicle_id 
         JOIN Users u ON p.user_id = u.user_id 
         ORDER BY p.created_at DESC`
    );
    return rows;
}
