export const forgotPasswordTemplate = (otp, expiry) => ({
  subject: "Your Password Reset OTP",
  html: `
    <h2>Password Reset</h2>
    <p>Your OTP is:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for ${expiry} minutes.</p>
    <p>If you didn't request this, ignore this email.</p>
  `,
});

export const registrationOtpTemplate = (otp, expiry) => ({
  subject: "Verify Your Email",
  html: `
    <h2>Welcome!</h2>
    <p>Use the OTP below to verify your email:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for ${expiry} minutes.</p>
  `,
});