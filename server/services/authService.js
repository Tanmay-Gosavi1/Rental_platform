import { getDB } from '../config/db.js';


export const findUserByEmail = async (email)=>{
    const db = getDB() ;
    const [rows] = await db.query(
            'SELECT * FROM Users WHERE email = ? LIMIT 1'
        ,[ email ]);

    return rows[0] || null ;
}

export const createUser = async (userData) => {
    const db = getDB() ;
    const {username , email , password , authProvider , googleId } = userData ;

    const [result] = await db.query(
        'INSERT INTO users (username , email , password, auth_provider, googleId) VALUES (?, ?, ?, ?, ?)' ,
        [username , email , password, authProvider || 'local', googleId || null]
    )
    return result;
}

export const updateUserPassword = async (email, newPassword) => {
    const db = getDB() ;
    const [result] = await db.query(
        'UPDATE Users SET password = ? WHERE email = ?' ,
        [newPassword , email]
    )
    return result[0] || null ;
}

export const updateUserGoogleAuth = async (email, googleId) => {
    const db = getDB() ;
    await db.query(
        'UPDATE Users SET google_id = ? , auth_provider = "google" WHERE email = ?' ,
        [googleId , email]
    )
}
 
export const findUserById = async (id) => {
    const db = getDB() ;
    const [rows] = await db.query(
        'SELECT * FROM Users WHERE user_id = ? LIMIT 1', [id]
    )
    return rows[0] || null ;
}

export const createOTP = async (otpData)=>{
    const db = getDB() ;
    const { email, otp, expiresAt } = otpData;

    await db.query(
        'INSERT INTO OTPs (email , otp , expires_at) VALUES (?, ?, ?)' ,
        [email, otp, expiresAt]
    )
}

export const findLatestOtpByEmail = async (email) => {
    const db = getDB() ;
    const [rows] = await db.query(
        'SELECT * FROM OTPs WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email]
    )
    return rows[0] || null ;
}

export const deleteOtpByEmail = async (email) => {
    const db = getDB() ;
    await db.query(
        'DELETE FROM OTPs WHERE email = ?', [email]
    )
}   