import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Home, 
    Car, 
    CalendarCheck, 
    User, 
    LogOut, 
    Menu, 
    X,
    ChevronDown,
    LoaderPinwheel
} from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/dashboard', icon: Home },
        { name: 'Vehicles', path: '/vehicles', icon: Car },
        { name: 'My Bookings', path: '/bookings', icon: CalendarCheck },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <LoaderPinwheel className="h-8 w-8" />
                        <span className="text-xl font-bold">AutoTrack</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 font-medium transition-colors ${
                                    isActive(link.path) 
                                        ? 'text-black' 
                                        : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                <link.icon size={18} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* User menu */}
                    <div className="hidden md:flex items-center">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{user?.username}</span>
                                    <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="font-semibold">{user?.username}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <User size={18} />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                                    isActive(link.path)
                                        ? 'bg-black text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <link.icon size={18} />
                                {link.name}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <User size={18} />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-3 bg-black text-white rounded-lg font-medium text-center"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

const CustomerLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default CustomerLayout;
