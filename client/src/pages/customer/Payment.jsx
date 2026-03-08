import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    CreditCard,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Calendar,
    Car,
    MapPin,
    Shield,
    IndianRupee,
    Clock
} from 'lucide-react';

const Payment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        loadRazorpay();
        fetchBookingDetails();
    }, [bookingId]);

    const loadRazorpay = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => {
            toast.error('Failed to load payment gateway');
            setRazorpayLoaded(false);
        };
        document.body.appendChild(script);
    };

    const fetchBookingDetails = async () => {
        try {
            const response = await axiosInstance.get(`/bookings/${bookingId}`);
            if (response.data.success) {
                setBooking(response.data.data);
                if (response.data.data.payment_status === 'paid') {
                    toast.success('Payment already completed!');
                    navigate('/bookings');
                }
            }
        } catch (error) {
            console.error('Error fetching booking:', error);
            toast.error('Booking not found');
            navigate('/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!razorpayLoaded) {
            toast.error('Payment gateway not loaded. Please refresh.');
            return;
        }

        setProcessing(true);
        try {
            // Create Razorpay order
            const orderResponse = await axiosInstance.post('/payments/create-order', {
                booking_id: parseInt(bookingId)
            });

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message);
            }

            const { order, key_id } = orderResponse.data.data;

            // Razorpay checkout options
            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: 'Vehicle Rental',
                description: `Booking #${bookingId}`,
                order_id: order.id,
                handler: async function (response) {
                    // Verify payment
                    try {
                        const verifyResponse = await axiosInstance.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.data.success) {
                            toast.success('Payment successful!');
                            navigate('/bookings');
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (_error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: booking?.username || '',
                    email: booking?.email || '',
                    contact: booking?.phone || ''
                },
                notes: {
                    booking_id: bookingId
                },
                theme: {
                    color: '#000000'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        toast.error('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description);
                setProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </CustomerLayout>
        );
    }

    if (!booking) {
        return (
            <CustomerLayout>
                <div className="text-center py-16">
                    <XCircle size={64} className="mx-auto text-red-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Booking not found</h3>
                    <Link to="/bookings" className="mt-4 inline-block text-blue-600 hover:underline">
                        Go to my bookings
                    </Link>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
                        
                        {/* Vehicle Info */}
                        <div className="flex gap-4 pb-6 border-b border-gray-200">
                            <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={booking.vehicle_image || 'https://via.placeholder.com/100x80?text=No+Image'}
                                    alt={booking.vehicle_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold">{booking.vehicle_name}</h3>
                                <p className="text-sm text-gray-500">Booking #{booking.booking_id}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="py-6 space-y-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Pick-up Date</p>
                                    <p className="font-medium">{formatDate(booking.start_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Drop-off Date</p>
                                    <p className="font-medium">{formatDate(booking.end_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Pick-up Location</p>
                                    <p className="font-medium">{booking.pickup_location}</p>
                                </div>
                            </div>
                            {booking.dropoff_location && (
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Drop-off Location</p>
                                        <p className="font-medium">{booking.dropoff_location}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="pt-6">
                            <div className="flex justify-between text-gray-600 mb-2">
                                <span>Rental Amount</span>
                                <span>{formatCurrency(booking.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 mb-2">
                                <span>Taxes & Fees</span>
                                <span>Included</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                                <span>Total Amount</span>
                                <span>{formatCurrency(booking.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-6">
                        {/* Payment Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold mb-6">Payment</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        checked 
                                        readOnly
                                        className="w-4 h-4" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">Online Payment</p>
                                        <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-6" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing || !razorpayLoaded}
                                className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        Pay {formatCurrency(booking.total_amount)}
                                    </>
                                )}
                            </button>

                            {!razorpayLoaded && (
                                <p className="text-sm text-yellow-600 text-center mt-2">
                                    Loading payment gateway...
                                </p>
                            )}
                        </div>

                        {/* Security Info */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <Shield size={24} className="text-green-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Secure Payment</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Your payment information is encrypted and secure. We use Razorpay for safe transactions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h4 className="font-semibold mb-3">Cancellation Policy</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    Free cancellation up to 24 hours before pickup
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    50% refund for cancellation within 24 hours
                                </li>
                                <li className="flex items-start gap-2">
                                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    No refund for no-show
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default Payment;
