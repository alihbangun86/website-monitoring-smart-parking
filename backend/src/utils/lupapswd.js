const nodemailer = require("nodemailer");
require("dotenv").config();

// 🔎 Debug (hapus nanti kalau sudah normal)
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "ADA" : "TIDAK ADA");

// 🚨 Cek apakah env tersedia
if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    throw new Error(
        "EMAIL atau EMAIL_PASS belum diset di file .env"
    );
}

// 🔐 Buat transporter Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

// ===================================================
// FUNGSI KIRIM OTP
// ===================================================
const sendOtpEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"Smart Parking System" <${process.env.EMAIL}>`,
            to,
            subject: "Kode OTP Reset Password",
            html: `
        <h3>Reset Password Smart Parking</h3>
        <p>Kode OTP Anda adalah:</p>
        <h2>${otp}</h2>
        <p>Berlaku selama 5 menit.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ OTP berhasil dikirim ke:", to);

    } catch (error) {
        console.error("❌ Email transporter error:", error);
        throw error;
    }
};

module.exports = { sendOtpEmail };
