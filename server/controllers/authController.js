import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js'
import { forgotPasswordTemplate, registrationOtpTemplate } from '../utils/emailTemplates.js';
import { findUserByEmail , createUser , createOTP , findLatestOtpByEmail , deleteOtpByEmail , updateUserPassword } from '../services/authService.js';

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await findUserByEmail(email);
    if(!user) {
      return res.status(400).json({ message: 'User does not exists!' });
    }

    if (user.authProvider === "google") {
        return res.status(400).json({
            success: false,
            message: "This account uses Google login",
        });
    }

    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({id : user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token' , token , {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    return res.status(200).json({ success: true, message: 'Logged in successfully' , 
        user : {
            id : user.user_id,
            username : user.username,
            email : user.email,
        } 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Error while logging in' , error: error.message });
  }
}

// Registration with OTP
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if(!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await findUserByEmail(email);
    if(existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

    const otpHash = await bcrypt.hash(otp.toString(), 10);

    await createOTP({
        email ,
        otp : otpHash,
        expiresAt : new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
    })

    const mailOptions = {
        from : `"Support" <${process.env.SENDER_EMAIL}>`,
        to : email,
        subject : registrationOtpTemplate(otp, 15).subject,
        text : registrationOtpTemplate(otp, 15).html.replace(/<[^>]+>/g, '') // Strip HTML tags for plain text version
    }
    await transporter.sendMail(mailOptions);

    return res.status(201).json({ success : true , message: 'Otp sent successfully'});

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Error while registering user' , error: error.message });
  }
}
export const verifyRegistrationOtp = async (req, res) => {
    try{
        const {username , email , password , otp} = req.body;

        if(!username || !email || !password || !otp) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const otpRecord = await findLatestOtpByEmail(email);
        if(!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP not found for this email' });
        }

        if(new Date(otpRecord.expiresAt) < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        const isValidOtp = await bcrypt.compare(otp, otpRecord.otp); // plain otp vs hashed otp
        if(!isValidOtp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            username,
            email,
            password: hashedPassword,
        });
        await deleteOtpByEmail(email);

        const token = jwt.sign({id : newUser.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token' , token , {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })

        return res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error while verifying OTP' , error: error.message });
    }
}

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error while logging out' , error: error.message });
  }
}

// Reset Password Controllers
export const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

        const otpHash = await bcrypt.hash(otp.toString(), 10);

        await createOTP({
            email ,
            otp : otpHash,
            expiresAt : new Date(Date.now() + 15 * 60 * 1000), // OTP expires in 15 minutes
        })

        const mailOptions = {
            from: `"Support" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: forgotPasswordTemplate(otp, 15).subject,
            text: forgotPasswordTemplate(otp, 15).html.replace(/<[^>]+>/g, ''), // Strip HTML tags for plain text version
        }
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Reset password OTP sent successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error while sending reset password OTP' , error: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if(!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const user = await findUserByEmail(email);
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otpRecord = await findLatestOtpByEmail(email);
        if(!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP not found for this email' });
        }

        if((new Date(otpRecord.expiresAt)) < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        const isValidOtp = await bcrypt.compare(otp, otpRecord.otp); // plain otp vs hashed otp
        if(!isValidOtp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(email, hashedPassword);
        await deleteOtpByEmail(email);

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error while resetting password' , error: error.message });
    }
}