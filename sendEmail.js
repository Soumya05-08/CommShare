// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP code',
    text: `Your OTP code is ${otp}. It will expire in ${process.env.OTP_EXPIRE_MIN || 10} minutes.`,
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in ${process.env.OTP_EXPIRE_MIN || 10} minutes.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Error sending OTP email:', err);
    throw err; // let caller know (signup route will catch)
  }
}

module.exports = { sendOTPEmail };
