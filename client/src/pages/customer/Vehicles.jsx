import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosInstance from '../../utils/axiosInstance';
import { 
    Search, 
    Car, 
    Bike, 
    CircleOff,
    MapPin,
    Star,
    Users,
    Fuel,
    Cog,
    Filter,
    X
} from 'lucide-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        fuel_type: 'all',
        transmission: 'all',
        minPrice: '',
        maxPrice: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles?available=true');
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
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

    const getTypeIcon = (type) => {
        switch (type) {
            case 'bike': return <Bike size={14} />;
            case 'scooty': return <CircleOff size={14} />;
            default: return <Car size={14} />;
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        // Only show available vehicles
        if (!v.is_available) return false;
        
        const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                             v.brand.toLowerCase().includes(search.toLowerCase()) ||
                             v.location.toLowerCase().includes(search.toLowerCase());
        const matchesType = filters.type === 'all' || v.type === filters.type;
        const matchesFuel = filters.fuel_type === 'all' || v.fuel_type === filters.fuel_type;
        const matchesTrans = filters.transmission === 'all' || v.transmission === filters.transmission;
        const matchesMinPrice = !filters.minPrice || v.price_per_day >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || v.price_per_day <= parseFloat(filters.maxPrice);

        return matchesSearch && matchesType && matchesFuel && matchesTrans && matchesMinPrice && matchesMaxPrice;
    });

    const clearFilters = () => {
        setFilters({
            type: 'all',
            fuel_type: 'all',
            transmission: 'all',
            minPrice: '',
            maxPrice: ''
        });
    };

    const hasActiveFilters = filters.type !== 'all' || filters.fuel_type !== 'all' || 
                            filters.transmission !== 'all' || filters.minPrice || filters.maxPrice;

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Available Vehicles</h1>
                    <p className="text-gray-500 mt-1">Find your perfect ride for any occasion</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${
                            hasActiveFilters ? 'border-black bg-black text-white' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Filter size={20} />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full"></span>}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Filters</h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                                    Clear all
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="all">All Types</option>
                                    <option value="car">Car</option>
                                    <option value="bike">Bike</option>
                                    <option value="scooty">Scooty</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                                <select
                                    value={filters.fuel_type}
                                    onChange={(e) => setFilters({...filters, fuel_type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="all">All</option>
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                                <select
                                    value={filters.transmission}
                                    onChange={(e) => setFilters({...filters, transmission: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="all">All</option>
                                    <option value="manual">Manual</option>
                                    <option value="automatic">Automatic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price/Day</label>
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                    placeholder="₹ 0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price/Day</label>
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                    placeholder="₹ 10000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Results count */}
                <p className="text-sm text-gray-500">
                    Showing {filteredVehicles.length} of {vehicles.filter(v => v.is_available).length} vehicles
                </p>

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <Car size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No vehicles found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map((vehicle) => (
                            <Link 
                                key={vehicle.vehicle_id} 
                                to={`/vehicles/${vehicle.vehicle_id}`}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="relative h-52 overflow-hidden">
                                    <img
                                        src={vehicle.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium capitalize">
                                            {getTypeIcon(vehicle.type)}
                                            {vehicle.type}
                                        </span>
                                    </div>
                                    {vehicle.rating > 0 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                            {vehicle.rating}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-gray-700 transition-colors">{vehicle.name}</h3>
                                            <p className="text-gray-500">{vehicle.brand}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={15} />
                                            {vehicle.seats}
                                        </span>
                                        <span className="flex items-center gap-1 capitalize">
                                            <Fuel size={15} />
                                            {vehicle.fuel_type}
                                        </span>
                                        <span className="flex items-center gap-1 capitalize">
                                            <Cog size={15} />
                                            {vehicle.transmission}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin size={15} />
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
        </CustomerLayout>
    );
};

export default Vehicles;
