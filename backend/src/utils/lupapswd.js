const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// cek koneksi email
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter OTP ready");
  }
});

console.log("EMAIL:", process.env.EMAIL_USER);

/**
 * Kirim OTP reset password
 */
const sendOtpEmail = async (toEmail, otp) => {
  try {
    // validasi email
    if (!toEmail || toEmail.trim() === "") {
      throw new Error("Email penerima tidak valid atau kosong");
    }

    console.log("🔔 Mengirim OTP ke:", toEmail);

    const info = await transporter.sendMail({
      from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Kode OTP Reset Password",
      html: `
        <h3>Reset Password</h3>
        <p>Gunakan kode OTP berikut untuk reset password Anda:</p>
        <h2 style="letter-spacing:2px;">${otp}</h2>
        <p><b>OTP berlaku selama 5 menit.</b></p>
        <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
      `,
    });

    console.log("✅ OTP berhasil dikirim:", info.messageId);
    console.log("📧 Diterima oleh:", info.accepted);

    return info;
  } catch (error) {
    console.error("❌ Gagal mengirim OTP:", error.message);
    console.error("Detail error:", error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
