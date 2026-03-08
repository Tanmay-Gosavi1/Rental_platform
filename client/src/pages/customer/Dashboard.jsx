import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { 
    Car, 
    CalendarCheck, 
    ArrowRight,
    MapPin,
    Star,
    Users,
    Fuel,
    Cog
} from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vehiclesRes, bookingsRes] = await Promise.all([
                axiosInstance.get('/vehicles?available=true'),
                axiosInstance.get('/bookings/my-bookings')
            ]);
            
            if (vehiclesRes.data.success) {
                setVehicles(vehiclesRes.data.data.slice(0, 6));
            }
            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
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
            <CustomerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                    <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
                    <p className="mt-2 text-gray-300">Find and book your perfect ride today.</p>
                    <Link 
                        to="/vehicles"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
                    >
                        Browse Vehicles
                        <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Recent Bookings */}
                {bookings.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Your Recent Bookings</h2>
                            <Link to="/bookings" className="text-sm text-gray-600 hover:text-black font-medium flex items-center gap-1">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {bookings.map((booking) => (
                                <div key={booking.booking_id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={booking.image_url || 'https://via.placeholder.com/80?text=Car'}
                                            alt={booking.vehicle_name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{booking.vehicle_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                        <span className="font-semibold">{formatCurrency(booking.total_price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Vehicles */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Available Vehicles</h2>
                        <Link to="/vehicles" className="text-sm text-gray-600 hover:text-black font-medium flex items-center gap-1">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {vehicles.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Car size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No vehicles available at the moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <Link 
                                    key={vehicle.vehicle_id} 
                                    to={`/vehicles/${vehicle.vehicle_id}`}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={vehicle.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={vehicle.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {vehicle.rating > 0 && (
                                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full text-sm font-medium">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                {vehicle.rating}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                                <p className="text-gray-500 text-sm">{vehicle.brand}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                                                {vehicle.type}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {vehicle.seats} Seats
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Fuel size={14} />
                                                {vehicle.fuel_type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Cog size={14} />
                                                {vehicle.transmission}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <MapPin size={14} />
                                                {vehicle.location}
                                            </div>
                                            <p className="text-xl font-bold">
                                                {formatCurrency(vehicle.price_per_day)}
                                                <span className="text-sm font-normal text-gray-500">/day</span>
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerDashboard;
