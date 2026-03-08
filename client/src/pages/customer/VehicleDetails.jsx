import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft,
    MapPin,
    Star,
    Users,
    Fuel,
    Cog,
    Calendar,
    IndianRupee,
    CheckCircle,
    Car,
    Info
} from 'lucide-react';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        start_date: '',
        end_date: '',
        pickup_location: '',
        notes: ''
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [isAvailable, setIsAvailable] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    useEffect(() => {
        if (bookingData.start_date && bookingData.end_date && vehicle) {
            calculatePrice();
            checkAvailability();
        }
    }, [bookingData.start_date, bookingData.end_date, vehicle]);

    const fetchVehicle = async () => {
        try {
            const response = await axiosInstance.get(`/vehicles/${id}`);
            if (response.data.success) {
                setVehicle(response.data.data);
                setBookingData(prev => ({
                    ...prev,
                    pickup_location: response.data.data.location
                }));
            }
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            toast.error('Vehicle not found');
            navigate('/vehicles');
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        const start = new Date(bookingData.start_date);
        const end = new Date(bookingData.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setTotalPrice(diffDays * parseFloat(vehicle.price_per_day));
    };

    const checkAvailability = async () => {
        if (!bookingData.start_date || !bookingData.end_date) return;
        
        setCheckingAvailability(true);
        try {
            const response = await axiosInstance.get('/bookings/check-availability', {
                params: {
                    vehicle_id: id,
                    start_date: bookingData.start_date,
                    end_date: bookingData.end_date
                }
            });
            setIsAvailable(response.data.available);
        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        
        if (!bookingData.start_date || !bookingData.end_date || !bookingData.pickup_location) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (new Date(bookingData.start_date) >= new Date(bookingData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        if (new Date(bookingData.start_date) < new Date().setHours(0, 0, 0, 0)) {
            toast.error('Start date cannot be in the past');
            return;
        }

        if (!isAvailable) {
            toast.error('Vehicle is not available for selected dates');
            return;
        }

        setBooking(true);
        try {
            const response = await axiosInstance.post('/bookings', {
                vehicle_id: parseInt(id),
                start_date: bookingData.start_date,
                end_date: bookingData.end_date,
                pickup_location: bookingData.pickup_location,
                notes: bookingData.notes
            });

            if (response.data.success) {
                toast.success('Booking created! Proceed to payment.');
                navigate(`/bookings/${response.data.data.booking_id}/payment`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating booking');
        } finally {
            setBooking(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const parseFeatures = (features) => {
        if (!features) return [];
        if (typeof features === 'string') {
            try {
                return JSON.parse(features);
            } catch {
                return [];
            }
        }
        return features;
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

    if (!vehicle) {
        return (
            <CustomerLayout>
                <div className="text-center py-16">
                    <Car size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Vehicle not found</h3>
                    <Link to="/vehicles" className="mt-4 inline-block text-blue-600 hover:underline">
                        Browse other vehicles
                    </Link>
                </div>
            </CustomerLayout>
        );
    }

    const features = parseFeatures(vehicle.features);

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vehicle Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image */}
                        <div className="relative rounded-2xl overflow-hidden h-80 lg:h-96">
                            <img
                                src={vehicle.image_url || 'https://via.placeholder.com/800x600?text=No+Image'}
                                alt={vehicle.name}
                                className="w-full h-full object-cover"
                            />
                            {!vehicle.is_available && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
                                        Not Available
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">{vehicle.name}</h1>
                                    <p className="text-gray-500 text-lg">{vehicle.brand} • {vehicle.model}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold">{formatCurrency(vehicle.price_per_day)}</p>
                                    <p className="text-gray-500">per day</p>
                                </div>
                            </div>

                            {vehicle.rating > 0 && (
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full">
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{vehicle.rating}</span>
                                    </div>
                                    <span className="text-gray-500">{vehicle.total_trips} trips completed</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                    <Users size={24} className="text-gray-600 mb-2" />
                                    <span className="font-semibold">{vehicle.seats}</span>
                                    <span className="text-sm text-gray-500">Seats</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                    <Fuel size={24} className="text-gray-600 mb-2" />
                                    <span className="font-semibold capitalize">{vehicle.fuel_type}</span>
                                    <span className="text-sm text-gray-500">Fuel</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                    <Cog size={24} className="text-gray-600 mb-2" />
                                    <span className="font-semibold capitalize">{vehicle.transmission}</span>
                                    <span className="text-sm text-gray-500">Transmission</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                    <Car size={24} className="text-gray-600 mb-2" />
                                    <span className="font-semibold capitalize">{vehicle.type}</span>
                                    <span className="text-sm text-gray-500">Type</span>
                                </div>
                            </div>

                            {vehicle.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold mb-2">About this vehicle</h3>
                                    <p className="text-gray-600">{vehicle.description}</p>
                                </div>
                            )}

                            {features.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold mb-3">Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((feature, index) => (
                                            <span key={index} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                                <CheckCircle size={14} />
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={18} />
                                    <span><strong>Location:</strong> {vehicle.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Book this vehicle</h2>
                            
                            <form onSubmit={handleBooking} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar size={14} className="inline mr-1" />
                                        Start Date *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="start_date"
                                        value={bookingData.start_date}
                                        onChange={handleInputChange}
                                        min={getMinDate() + 'T00:00'}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar size={14} className="inline mr-1" />
                                        End Date *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="end_date"
                                        value={bookingData.end_date}
                                        onChange={handleInputChange}
                                        min={bookingData.start_date || getMinDate() + 'T00:00'}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin size={14} className="inline mr-1" />
                                        Pickup Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="pickup_location"
                                        value={bookingData.pickup_location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="Enter pickup location"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={bookingData.notes}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                        placeholder="Any special requirements..."
                                    />
                                </div>

                                {/* Availability Status */}
                                {bookingData.start_date && bookingData.end_date && (
                                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                                        checkingAvailability ? 'bg-gray-100 text-gray-600' :
                                        isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {checkingAvailability ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                                                <span className="text-sm">Checking availability...</span>
                                            </>
                                        ) : isAvailable ? (
                                            <>
                                                <CheckCircle size={16} />
                                                <span className="text-sm font-medium">Available for selected dates</span>
                                            </>
                                        ) : (
                                            <>
                                                <Info size={16} />
                                                <span className="text-sm font-medium">Not available for selected dates</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Price Summary */}
                                {totalPrice > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Price per day</span>
                                            <span>{formatCurrency(vehicle.price_per_day)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Duration</span>
                                            <span>{Math.ceil((new Date(bookingData.end_date) - new Date(bookingData.start_date)) / (1000 * 60 * 60 * 24)) || 1} days</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                                            <span>Total</span>
                                            <span className="text-xl">{formatCurrency(totalPrice)}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={booking || !isAvailable || !vehicle.is_available || checkingAvailability}
                                    className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {booking ? 'Creating Booking...' : 'Book Now'}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    You will be redirected to payment after booking
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default VehicleDetails;
