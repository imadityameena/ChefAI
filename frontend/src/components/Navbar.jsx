import { Link, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChefHat,
    Home,
    UtensilsCrossed,
    Calendar,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
    }, []);

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center min-h-14 py-1.5 gap-2.5 sm:gap-3">

                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className="flex items-center shrink-0"
                    >
                        <BrandLogo compact imageClassName="h-28 sm:h-32" />
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink
                            to="/dashboard"
                            icon={<Home className="w-4 h-4" />}
                            label="Dashboard"
                        />

                        <NavLink
                            to="/pantry"
                            icon={<UtensilsCrossed className="w-4 h-4" />}
                            label="Pantry"
                        />

                        <NavLink
                            to="/generate"
                            icon={<ChefHat className="w-4 h-4" />}
                            label="Generate"
                        />

                        <NavLink
                            to="/recipes"
                            icon={<UtensilsCrossed className="w-4 h-4" />}
                            label="Recipes"
                        />

                        <NavLink
                            to="/meal-plan"
                            icon={<Calendar className="w-4 h-4" />}
                            label="Meal Plan"
                        />

                        <NavLink
                            to="/shopping-list"
                            icon={<ShoppingCart className="w-4 h-4" />}
                            label="Shopping"
                        />
                    </div>

                    {/* User Profile Dropdown */}
                    <div
                        className="relative"
                        ref={dropdownRef}
                    >
                        <button
                            onClick={() =>
                                setIsDropdownOpen(
                                    !isDropdownOpen
                                )
                            }
                            className="flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-sm text-gray-700 transition-colors hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        >
                            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            <span className="hidden sm:inline font-medium">
                                {user?.name || 'User'}
                            </span>

                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                    isDropdownOpen
                                        ? 'rotate-180'
                                        : ''
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50">

                                {/* User Info */}
                                <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {user?.name || 'User'}
                                            </p>

                                            <p className="text-xs text-gray-500 truncate">
                                                {user?.email || 'user@example.com'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <Link
                                    to="/settings"
                                    onClick={() =>
                                        setIsDropdownOpen(false)
                                    }
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </Link>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    return (
        <RouterNavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </RouterNavLink>
    );
};

export default Navbar;
