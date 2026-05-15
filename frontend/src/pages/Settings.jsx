import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIETARY_OPTIONS = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo'
];

const CUISINES = [
    'Any',
    'Italian',
    'Mexican',
    'Indian',
    'Chinese',
    'Japanese',
    'Thai',
    'French',
    'Mediterranean',
    'American'
];

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    // Preferences state
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/users/profile');

            const {
                user,
                preferences: userPrefs
            } = response.data.data;

            setProfile({
                name: user.name,
                email: user.email
            });

            if (userPrefs) {
                setPreferences({
                    dietary_restrictions:
                        userPrefs.dietary_restrictions || [],
                    allergies:
                        userPrefs.allergies || [],
                    preferred_cuisines:
                        userPrefs.preferred_cuisines || [],
                    default_servings:
                        userPrefs.default_servings || 4,
                    measurement_unit:
                        userPrefs.measurement_unit || 'metric'
                });
            }
        } catch (error) {
            toast.error('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/users/profile', profile);

            toast.success(
                'Profile updated successfully'
            );

            // Update local storage
            const updatedUser = {
                ...user,
                ...profile
            };

            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            );
        } catch (error) {
            toast.error(
                'Failed to update profile'
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put(
                '/users/preferences',
                preferences
            );

            toast.success(
                'Preferences updated successfully'
            );
        } catch (error) {
            toast.error(
                'Failed to update preferences'
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            toast.error(
                'Passwords do not match'
            );
            return;
        }

        if (
            passwordData.newPassword.length < 6
        ) {
            toast.error(
                'Password must be at least 6 characters'
            );
            return;
        }

        setSaving(true);

        try {
            await api.put(
                '/users/change-password',
                {
                    currentPassword:
                        passwordData.currentPassword,
                    newPassword:
                        passwordData.newPassword
                }
            );

            toast.success(
                'Password changed successfully'
            );

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to change password'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (
            !confirm(
                'Are you sure you want to delete your account? This action cannot be undone.'
            )
        ) {
            return;
        }

        const confirmation = prompt(
            'Type "DELETE" to confirm account deletion:'
        );

        if (confirmation !== 'DELETE') {
            toast.error(
                'Account deletion cancelled'
            );
            return;
        }

        try {
            await api.delete('/users/account');

            toast.success(
                'Account deleted successfully'
            );

            logout();
            navigate('/login');
        } catch (error) {
            toast.error(
                'Failed to delete account'
            );
        }
    };

    const toggleDietary = (option) => {
        setPreferences((prev) => ({
            ...prev,
            dietary_restrictions:
                prev.dietary_restrictions.includes(option)
                    ? prev.dietary_restrictions.filter(
                        (d) => d !== option
                    )
                    : [
                        ...prev.dietary_restrictions,
                        option
                    ]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences((prev) => ({
            ...prev,
            preferred_cuisines:
                prev.preferred_cuisines.includes(cuisine)
                    ? prev.preferred_cuisines.filter(
                        (c) => c !== cuisine
                    )
                    : [
                        ...prev.preferred_cuisines,
                        cuisine
                    ]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your account and
                        preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                Profile Information
                            </h2>
                        </div>

                        <form
                            onSubmit={
                                handleProfileUpdate
                            }
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        name:
                                            e.target
                                                .value
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />

                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;