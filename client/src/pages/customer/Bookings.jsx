import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
    Calendar,
    MapPin,
    Car,
    IndianRupee,
    Clock,
    ChevronRight,
    Filter,
    Search,
    AlertCircle,
    CheckCircle,
    XCircle,
    CreditCard,
    Package
} from 'lucide-react';

const Bookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axiosInstance.get('/bookings/my');
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        setCancellingId(bookingId);
        try {
            const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
            if (response.data.success) {
                toast.success('Booking cancelled successfully');
                fetchBookings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
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

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            active: 'bg-green-100 text-green-700',
            completed: 'bg-gray-100 text-gray-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-600',
            paid: 'text-green-600',
            refunded: 'text-blue-600',
            failed: 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    };

    const filteredBookings = filter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filter);

    const stats = {
        total: bookings.length,
        active: bookings.filter(b => b.status === 'active').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        completed: bookings.filter(b => b.status === 'completed').length
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

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">My Bookings</h1>
                    <p className="text-gray-500">View and manage your vehicle bookings</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Package size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-gray-500">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Car size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-sm text-gray-500">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock size={20} className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-sm text-gray-500">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === status 
                                    ? 'bg-black text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Car size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No bookings found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === 'all' 
                                ? "You haven't made any bookings yet" 
                                : `No ${filter} bookings`}
                        </p>
                        <Link 
                            to="/vehicles" 
                            className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Browse Vehicles
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div 
                                key={booking.booking_id} 
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Vehicle Image */}
                                    <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                                        <img
                                            src={booking.vehicle_image || 'https://via.placeholder.com/200x150?text=No+Image'}
                                            alt={booking.vehicle_name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    {/* Booking Info */}
                                    <div className="flex-1 p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold">{booking.vehicle_name}</h3>
                                                <p className="text-gray-500 text-sm">Booking #{booking.booking_id}</p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        <span>
                                                            <strong>From:</strong> {formatDate(booking.start_date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        <span>
                                                            <strong>To:</strong> {formatDate(booking.end_date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin size={16} className="text-gray-400" />
                                                        <span>{booking.pickup_location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CreditCard size={16} className="text-gray-400" />
                                                        <span className={getPaymentStatusColor(booking.payment_status)}>
                                                            Payment: {booking.payment_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">{formatCurrency(booking.total_amount)}</p>
                                                    <p className="text-sm text-gray-500">Total</p>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    {booking.status === 'pending' && booking.payment_status === 'pending' && (
                                                        <button
                                                            onClick={() => navigate(`/bookings/${booking.booking_id}/payment`)}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                    
                                                    {['pending', 'confirmed'].includes(booking.status) && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.booking_id)}
                                                            disabled={cancellingId === booking.booking_id}
                                                            className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                        >
                                                            {cancellingId === booking.booking_id ? 'Cancelling...' : 'Cancel'}
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/vehicles/${booking.vehicle_id}`}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        View Vehicle
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default Bookings;
