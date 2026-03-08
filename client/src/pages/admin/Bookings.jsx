import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
    Search,
    Calendar,
    MapPin,
    User,
    Car,
    ChevronDown,
    Eye,
    X
} from 'lucide-react';

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
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

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold">Booking #{booking.booking_id}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <img
                            src={booking.image_url || 'https://via.placeholder.com/100?text=Car'}
                            alt={booking.vehicle_name}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div>
                            <h3 className="font-semibold text-lg">{booking.vehicle_name}</h3>
                            <p className="text-gray-500">{booking.brand}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium">{booking.username}</p>
                            <p className="text-sm text-gray-500">{booking.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusBadge(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p className="font-medium">{formatDate(booking.start_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">End Date</p>
                            <p className="font-medium">{formatDate(booking.end_date)}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>Pickup: {booking.pickup_location}</span>
                        </div>
                        {booking.dropoff_location && (
                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                <MapPin size={16} />
                                <span>Dropoff: {booking.dropoff_location}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                                booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {booking.payment_status}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold">{formatCurrency(booking.total_price)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axiosInstance.get('/bookings/admin/all');
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Error fetching bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (id, status) => {
        try {
            await axiosInstance.patch(`/bookings/admin/${id}/status`, { status });
            toast.success('Booking status updated');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            b.username?.toLowerCase().includes(search.toLowerCase()) ||
            b.vehicle_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.booking_id.toString().includes(search);
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage all rental bookings</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by ID, customer, or vehicle..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.booking_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="font-medium">#{booking.booking_id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User size={16} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{booking.username}</p>
                                                        <p className="text-xs text-gray-500">{booking.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={booking.image_url || 'https://via.placeholder.com/40?text=Car'}
                                                        alt={booking.vehicle_name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm">{booking.vehicle_name}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{booking.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p>{formatDate(booking.start_date)}</p>
                                                    <p className="text-gray-500">to {formatDate(booking.end_date)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                                                <p className={`text-xs ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {booking.payment_status}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => updateBookingStatus(booking.booking_id, e.target.value)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium cursor-pointer ${getStatusBadge(booking.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="ongoing">Ongoing</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} className="text-gray-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </AdminLayout>
    );
};

export default AdminBookings;
