import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserById } from '../services/authService.js';
dotenv.config();


const protect = (req, res, next) => {
    const {token} = req.cookies;
    if(!token) {
        return res.status(401).json({ message: 'Unauthorized. Login Again' });
    }
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.user = decoded
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Error while verifying token' , error: error.message });
    }
}

// Admin middleware - checks if user is admin
export const adminOnly = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Login Again' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
        }

        req.user = { id: user.user_id, role: user.role };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Error while verifying token', error: error.message });
    }
}

export default protect;