import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createPayment, findPaymentByOrderId, updatePaymentSuccess, updatePaymentFailed, findAllPayments, findPaymentByBookingId } from '../services/paymentService.js';
import { findBookingById, updateBookingPaymentStatus, updateBookingStatus } from '../services/bookingService.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
export const createOrder = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const user_id = req.user.id;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }

        // Find the booking
        const booking = await findBookingById(booking_id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check if already paid
        if (booking.payment_status === 'paid') {
            return res.status(400).json({ success: false, message: 'Booking already paid' });
        }

        // Verify the booking belongs to the user
        if (booking.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Check if payment already exists
        const existingPayment = await findPaymentByBookingId(booking_id);
        if (existingPayment && existingPayment.status === 'captured') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(booking.total_price * 100), // Amount in paise
            currency: 'INR',
            receipt: `booking_${booking_id}`,
            notes: {
                booking_id: booking_id,
                user_id: user_id
            }
        };

        const order = await razorpay.orders.create(options);

        // Save payment record
        await createPayment({
            booking_id,
            user_id,
            razorpay_order_id: order.id,
            amount: booking.total_price,
            currency: 'INR'
        });

        return res.status(200).json({
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID,
                booking_id,
                user: {
                    name: booking.username,
                    email: booking.email
                }
            }
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return res.status(500).json({ success: false, message: 'Error creating payment order', error: error.message });
    }
}

// Verify payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            await updatePaymentFailed(razorpay_order_id);
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Update payment record
        await updatePaymentSuccess(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        // Find payment to get booking_id
        const payment = await findPaymentByOrderId(razorpay_order_id);
        if (payment) {
            // Update booking payment status
            await updateBookingPaymentStatus(payment.booking_id, 'paid');
            // Confirm the booking
            await updateBookingStatus(payment.booking_id, 'confirmed');
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
    }
}

// Dummy payment handler for development/demo mode
export const dummySuccessPayment = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const user_id = req.user.id;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }

        const booking = await findBookingById(booking_id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (booking.payment_status === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Payment already completed',
                data: {
                    booking_id,
                    payment_status: 'paid',
                    booking_status: booking.status
                }
            });
        }

        let payment = await findPaymentByBookingId(booking_id);
        let orderId = payment?.razorpay_order_id;

        if (!orderId) {
            orderId = `dummy_order_${booking_id}_${Date.now()}`;
            await createPayment({
                booking_id,
                user_id,
                razorpay_order_id: orderId,
                amount: booking.total_price,
                currency: 'INR'
            });
            payment = await findPaymentByBookingId(booking_id);
        }

        const paymentId = `dummy_payment_${booking_id}_${Date.now()}`;
        await updatePaymentSuccess(orderId, paymentId, 'dummy_signature');
        await updateBookingPaymentStatus(booking_id, 'paid');
        await updateBookingStatus(booking_id, 'confirmed');

        return res.status(200).json({
            success: true,
            message: 'Dummy payment successful',
            data: {
                booking_id,
                order_id: orderId,
                payment_id: paymentId,
                payment_status: 'paid',
                booking_status: 'confirmed'
            }
        });
    } catch (error) {
        console.error('Dummy payment error:', error);
        return res.status(500).json({ success: false, message: 'Error processing dummy payment', error: error.message });
    }
}

// Get payment status
export const getPaymentStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const payment = await findPaymentByOrderId(order_id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        return res.status(200).json({ success: true, data: payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching payment status', error: error.message });
    }
}

// Admin: Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await findAllPayments();
        return res.status(200).json({ success: true, data: payments });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
    }
}

// Webhook handler for Razorpay
export const webhookHandler = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const orderId = payload.payment.entity.order_id;
            const paymentId = payload.payment.entity.id;

            const payment = await findPaymentByOrderId(orderId);
            if (payment) {
                await updatePaymentSuccess(orderId, paymentId, 'webhook');
                await updateBookingPaymentStatus(payment.booking_id, 'paid');
                await updateBookingStatus(payment.booking_id, 'confirmed');
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
}
