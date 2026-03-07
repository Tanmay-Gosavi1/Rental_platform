import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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

export default protect;