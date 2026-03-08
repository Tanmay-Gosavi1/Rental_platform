import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../utils/axiosInstance';
import { 
    Car, 
    CalendarCheck, 
    Users, 
    IndianRupee,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
            <div className={`p-4 rounded-xl ${bgColor}`}>
                <Icon size={28} className={color} />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/bookings/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your rentals.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={IndianRupee}
                        title="Total Revenue"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        color="text-green-600"
                        bgColor="bg-green-100"
                    />
                    <StatCard 
                        icon={CalendarCheck}
                        title="Total Bookings"
                        value={stats?.totalBookings || 0}
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                    />
                    <StatCard 
                        icon={Car}
                        title="Total Vehicles"
                        value={stats?.totalVehicles || 0}
                        color="text-purple-600"
                        bgColor="bg-purple-100"
                    />
                    <StatCard 
                        icon={Users}
                        title="Total Customers"
                        value={stats?.totalUsers || 0}
                        color="text-orange-600"
                        bgColor="bg-orange-100"
                    />
                </div>

                {/* Booking Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center gap-3">
                            <Clock className="text-yellow-600" size={24} />
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-800">{stats?.pendingBookings || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-600" size={24} />
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Confirmed</p>
                                <p className="text-2xl font-bold text-blue-800">{stats?.confirmedBookings || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                                <p className="text-sm text-green-700 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-green-800">{stats?.completedBookings || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <div className="flex items-center gap-3">
                            <XCircle className="text-red-600" size={24} />
                            <div>
                                <p className="text-sm text-red-700 font-medium">Cancelled</p>
                                <p className="text-2xl font-bold text-red-800">
                                    {(stats?.totalBookings || 0) - (stats?.pendingBookings || 0) - (stats?.confirmedBookings || 0) - (stats?.completedBookings || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Bookings</h2>
                        <Link to="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats?.recentBookings?.length > 0 ? (
                                    stats.recentBookings.map((booking) => (
                                        <tr key={booking.booking_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                #{booking.booking_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {booking.username}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {booking.vehicle_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(booking.total_price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No recent bookings
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
