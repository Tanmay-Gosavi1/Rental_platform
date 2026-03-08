import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Search,
    X,
    Car,
    Bike,
    CircleOff,
    Check
} from 'lucide-react';

const VehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        type: 'car',
        fuel_type: 'petrol',
        transmission: 'manual',
        seats: 4,
        price_per_day: '',
        price_per_hour: '',
        location: '',
        description: '',
        image_url: '',
        features: []
    });
    const [loading, setLoading] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                features: vehicle.features ? (typeof vehicle.features === 'string' ? JSON.parse(vehicle.features) : vehicle.features) : []
            });
        } else {
            setFormData({
                name: '',
                brand: '',
                model: '',
                type: 'car',
                fuel_type: 'petrol',
                transmission: 'manual',
                seats: 4,
                price_per_day: '',
                price_per_hour: '',
                location: '',
                description: '',
                image_url: '',
                features: []
            });
        }
    }, [vehicle, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
            setFeatureInput('');
        }
    };

    const removeFeature = (feature) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (vehicle) {
                await axiosInstance.put(`/vehicles/${vehicle.vehicle_id}`, formData);
                toast.success('Vehicle updated successfully');
            } else {
                await axiosInstance.post('/vehicles', formData);
                toast.success('Vehicle created successfully');
            }
            onSave();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving vehicle');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Swift Dzire"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Maruti Suzuki"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="VXI"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                                <option value="scooty">Scooty</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                            <select
                                name="fuel_type"
                                value={formData.fuel_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                            <input
                                type="number"
                                name="seats"
                                value={formData.seats}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Day (₹)</label>
                            <input
                                type="number"
                                name="price_per_day"
                                value={formData.price_per_day}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="1500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Hour (₹)</label>
                            <input
                                type="number"
                                name="price_per_hour"
                                value={formData.price_per_hour}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Bangalore"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            placeholder="Describe the vehicle..."
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Add feature (e.g., AC, GPS)"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.features.map((feature, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                                    {feature}
                                    <button type="button" onClick={() => removeFeature(feature)}>
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (vehicle ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await axiosInstance.get('/vehicles');
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Error fetching vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await axiosInstance.delete(`/vehicles/${id}`);
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting vehicle');
        }
    };

    const handleToggleAvailability = async (vehicle) => {
        try {
            await axiosInstance.patch(`/vehicles/${vehicle.vehicle_id}/availability`, {
                is_available: !vehicle.is_available
            });
            toast.success(`Vehicle ${vehicle.is_available ? 'disabled' : 'enabled'} successfully`);
            fetchVehicles();
        } catch (_error) {
            toast.error('Error updating availability');
        }
    };

    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingVehicle(null);
        setModalOpen(true);
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                             v.brand.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || v.type === filter;
        return matchesSearch && matchesFilter;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'bike': return <Bike size={16} />;
            case 'scooty': return <CircleOff size={16} />;
            default: return <Car size={16} />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
                        <p className="text-gray-500 mt-1">Manage your vehicle fleet</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                        <Plus size={20} />
                        Add Vehicle
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="car">Cars</option>
                        <option value="bike">Bikes</option>
                        <option value="scooty">Scooties</option>
                    </select>
                </div>

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Car size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No vehicles found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.vehicle_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="relative h-48">
                                    <img
                                        src={vehicle.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                                        vehicle.is_available 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {vehicle.is_available ? 'Available' : 'Unavailable'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                            <p className="text-gray-500 text-sm">{vehicle.brand}</p>
                                        </div>
                                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                                            {getTypeIcon(vehicle.type)}
                                            {vehicle.type}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-xl font-bold">{formatCurrency(vehicle.price_per_day)}<span className="text-sm font-normal text-gray-500">/day</span></p>
                                        <p className="text-sm text-gray-500">{vehicle.location}</p>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => openEditModal(vehicle)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleAvailability(vehicle)}
                                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
                                                vehicle.is_available
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                        >
                                            {vehicle.is_available ? <CircleOff size={16} /> : <Check size={16} />}
                                            {vehicle.is_available ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.vehicle_id)}
                                            className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <VehicleModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                vehicle={editingVehicle}
                onSave={fetchVehicles}
            />
        </AdminLayout>
    );
};

export default AdminVehicles;
