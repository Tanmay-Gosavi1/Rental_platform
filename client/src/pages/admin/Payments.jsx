import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
    Search,
    CreditCard,
    IndianRupee,
    Calendar,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axiosInstance.get('/payments/admin/all');
            if (response.data.success) {
                setPayments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error fetching payments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
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
            created: 'bg-gray-100 text-gray-700',
            authorized: 'bg-blue-100 text-blue-700',
            captured: 'bg-green-100 text-green-700',
            refunded: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'captured': return <CheckCircle size={14} className="text-green-600" />;
            case 'failed': return <XCircle size={14} className="text-red-600" />;
            default: return <Clock size={14} className="text-gray-600" />;
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = 
            p.username?.toLowerCase().includes(search.toLowerCase()) ||
            p.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase()) ||
            p.razorpay_order_id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = payments
        .filter(p => p.status === 'captured')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-500 mt-1">View all payment transactions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <IndianRupee className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <CreditCard className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-bold">{payments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Successful</p>
                                <p className="text-2xl font-bold">{payments.filter(p => p.status === 'captured').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <XCircle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Failed</p>
                                <p className="text-2xl font-bold">{payments.filter(p => p.status === 'failed').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by customer or payment ID..."
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
                        <option value="created">Created</option>
                        <option value="captured">Captured</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No payments found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.payment_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {payment.razorpay_payment_id || `#${payment.payment_id}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Order: {payment.razorpay_order_id?.slice(-12) || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-sm">{payment.username}</p>
                                                    <p className="text-xs text-gray-500">{payment.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm">{payment.vehicle_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                                                <p className="text-xs text-gray-500">{payment.currency}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(payment.payment_date || payment.created_at)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPayments;
