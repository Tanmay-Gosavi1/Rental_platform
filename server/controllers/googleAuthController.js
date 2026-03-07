import  { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
    try {
        const {googleAccessToken} = req.body;

        if(!googleAccessToken) {
            return res.status(400).json({ message: 'Google Access Token is required' });
        }

        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                "Authorization": `Bearer ${googleAccessToken}`
            }
        });

        const { name, email, sub: googleId } = googleResponse.data;

        // check if user already exists
        let user = await User.findOne({ email });

        // If user exists with google auth, verify googleId
        if(user && user.authProvider === 'google'){
            if(user.googleId !== googleId) {
                return res.status(400).json({ message: 'Google Account mismatch' });
            }
        }
        // If user exists with local auth, link google account
        else if(user && user.authProvider === 'local') {
            user.googleId = googleId;
            user.authProvider = 'google';
            await user.save();
        }
        // If user doesn't exist, create a new user
        else if(!user) {
            user = await User.create({
                username: name,
                email,
                authProvider: 'google',
                googleId,
            });
        }
        const token = jwt.sign({id : user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token' , token , {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })

        return res.status(200).json({ success: true, message: 'Logged in with Google successfully', user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error while logging in with Google', error: error.message });
    }
}