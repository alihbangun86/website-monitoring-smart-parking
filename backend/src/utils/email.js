const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter ready");
  }
});

console.log("EMAIL:", process.env.EMAIL_USER);


const sendVerificationEmail = async (toEmail) => {
  try {
    // Validasi email
    if (!toEmail || toEmail.trim() === "") {
      throw new Error("Email penerima tidak valid atau kosong");
    }

    console.log("🔔 Mengirim email verifikasi ke:", toEmail);

    const info = await transporter.sendMail({
      from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Akun Anda Telah Diverifikasi",
      html: `
        <h3>Verifikasi Akun Berhasil</h3>
        <p>Akun Anda telah diverifikasi oleh admin.</p>
        <p>Silakan login ke sistem Smart Parking.</p>
      `,
    });

    console.log("✅ Email berhasil dikirim:", info.messageId);
    console.log("📧 Diterima oleh:", info.accepted);
    
    return info;
  } catch (error) {
    console.error("❌ Gagal mengirim email:", error.message);
    console.error("Detail error:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
