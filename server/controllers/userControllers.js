import { findUserById, findAllUsers, updateUserProfile } from "../services/authService.js";

export const getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true, message: 'Profile fetched successfully',
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profile_image: user.profile_image,
                google_id: user.google_id,
                created_at: user.created_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error while fetching profile', error: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { username, phone, profile_image } = req.body;

        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await updateUserProfile(id, { username, phone, profile_image });

        const updatedUser = await findUserById(id);
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                profile_image: updatedUser.profile_image,
                google_id: updatedUser.google_id,
                created_at: updatedUser.created_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error while updating profile', error: error.message });
    }
}

// Admin: Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await findAllUsers();
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
}