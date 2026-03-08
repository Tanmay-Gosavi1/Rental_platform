import { findUserById } from "../services/authService.js";

export const getProfile = async (req, res) => {
    try {
        const {id} = req.user;
        const user = await findUserById(id);
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'Profile fetched successfully' , 
            user : {
                id : user.user_id,
                username : user.username,
                email : user.email,
            } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error while fetching profile' , error: error.message });    
    }
}