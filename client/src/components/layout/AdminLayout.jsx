import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Car, 
    CalendarCheck, 
    Users, 
    CreditCard, 
    Settings, 
    LogOut, 
    Menu, 
    X,
    ChevronDown,
    LoaderPinwheel
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Vehicles', icon: Car, path: '/admin/vehicles' },
        { name: 'Bookings', icon: CalendarCheck, path: '/admin/bookings' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-white border-r border-gray-200
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                        <Link to="/" className="flex items-center gap-2">
                            <LoaderPinwheel className="h-8 w-8" />
                            <span className="text-xl font-bold">AutoTrack</span>
                        </Link>
                        <button 
                            className="lg:hidden p-1 hover:bg-gray-100 rounded"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                                    transition-all duration-200
                                    ${isActive(item.path) 
                                        ? 'bg-black text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user?.username}</p>
                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <button
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="lg:hidden"></div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            Admin
                        </span>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
