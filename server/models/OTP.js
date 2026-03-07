import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email : {type : String, required : true, trim: true, lowercase : true},
    otp : {type : String, required : true}, //hashed Otp
    expiresAt : {type : Number, index: { expires: 0 } , required : true},
}, {timestamps : true})

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;