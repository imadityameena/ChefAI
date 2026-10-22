import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import { MIN_PASSWORD_LENGTH } from './authController.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Get user profile
 */
export const getProfile = async (
    req,
    res,
    next
) => {
    try {
        const [user, preferences] = await Promise.all([
            User.findById(req.user.id),
            UserPreference.findByUserId(req.user.id)
        ]);

        res.json({
            success: true,
            data: {
                user,
                preferences
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (
    req,
    res,
    next
) => {
    try {
        const name =
            typeof req.body.name === 'string'
                ? req.body.name.trim() || undefined
                : undefined;
        const email =
            typeof req.body.email === 'string'
                ? req.body.email.trim() || undefined
                : undefined;

        if (email) {
            if (!EMAIL_PATTERN.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            const existing = await User.findByEmail(email);

            if (existing && existing.id !== req.user.id) {
                return res.status(409).json({
                    success: false,
                    message: 'That email is already in use'
                });
            }
        }

        const user = await User.update(
            req.user.id,
            { name, email }
        );

        res.json({
            success: true,
            message:
                'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user preferences
 */
export const updatePreferences =
async (req, res, next) => {
    try {
        const preferences =
            await UserPreference.upsert(
                req.user.id,
                req.body
            );

        res.json({
            success: true,
            message:
                'Preferences updated successfully',
            data: { preferences }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 */
export const changePassword =
async (req, res, next) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Please provide current and new password'
            });
        }

        if (
            typeof newPassword !== 'string' ||
            newPassword.length < MIN_PASSWORD_LENGTH
        ) {
            return res.status(400).json({
                success: false,
                message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
            });
        }

        // Verify current password (look up by ID: the email in the
        // token may be out of date if the user changed it)
        const user =
            await User.findByIdWithPassword(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValid =
            await User.verifyPassword(
                currentPassword,
                user.password_hash
            );

        if (!isValid) {
            // 400, not 401: the session is fine, only the input is wrong
            return res.status(400).json({
                success: false,
                message:
                    'Current password is incorrect'
            });
        }

        // Update password
        await User.updatePassword(
            req.user.id,
            newPassword
        );

        res.json({
            success: true,
            message:
                'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete account
 */
export const deleteAccount =
async (req, res, next) => {
    try {
        await User.delete(req.user.id);

        res.json({
            success: true,
            message:
                'Account deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};