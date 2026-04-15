import React, { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    User,
    Mail,
    Phone,
    Shield,
    Camera,
    Save,
    Loader,
    Calendar,
    CheckCircle
} from 'lucide-react';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
        profile_image: user?.profile_image || ''
    });

    useEffect(() => {
        setFormData({
            username: user?.username || '',
            phone: user?.phone || '',
            profile_image: user?.profile_image || ''
        });
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.put('/user/profile', formData);
            if (response.data.success) {
                toast.success('Profile updated successfully');
                if (refreshUser) {
                    await refreshUser();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <CustomerLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-gray-500">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-black p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-gray-700 overflow-hidden">
                                    {formData.profile_image ? (
                                        <img 
                                            src={formData.profile_image} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Camera size={16} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="text-center md:text-left text-white">
                                <h2 className="text-2xl font-bold">{user?.username}</h2>
                                <p className="text-gray-300">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                                        {user?.role}
                                    </span>
                                    {user?.google_id && (
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            Google Connected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User size={14} className="inline mr-2" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail size={14} className="inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone size={14} className="inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            {/* Profile Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Camera size={14} className="inline mr-2" />
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    name="profile_image"
                                    value={formData.profile_image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Calendar size={20} className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="font-medium">{formatDate(user?.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Shield size={20} className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Account Type</p>
                                <p className="font-medium capitalize">{user?.role} Account</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-4">Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-gray-400" />
                                <div>
                                    <p className="font-medium">Password</p>
                                    <p className="text-sm text-gray-500">Last changed: Never</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Change
                            </button>
                        </div>
                        
                        {user?.google_id && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <CheckCircle size={20} className="text-green-600" />
                                <div>
                                    <p className="font-medium text-green-700">Google Account Connected</p>
                                    <p className="text-sm text-green-600">You can sign in using Google</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default Profile;
