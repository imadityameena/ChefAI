import { createContext, useContext, useState } from 'react';
import api from "../services/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};

export const AuthProvider = ({ children }) => {
    // Read the saved session straight away, so there's no loading flash
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (!token || !savedUser) return null;
        try {
            return JSON.parse(savedUser);
        } catch {
            // Corrupted value in storage: treat as logged out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }
    });
    const loading = false;

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem(
                'user',
                JSON.stringify(user)
            );

            setUser(user);

            return { success: true };

        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/signup', {
                name,
                email,
                password
            });

            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem(
                'user',
                JSON.stringify(user)
            );

            setUser(user);

            return { success: true };

        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Update the logged-in user's details (e.g. after editing the profile)
    const updateUser = (updates) => {
        setUser((current) => {
            const updated = { ...current, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};