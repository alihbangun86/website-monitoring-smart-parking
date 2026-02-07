require("dotenv").config();
const { sendVerificationEmail } = require("./src/utils/email");

const TEST_EMAIL = "alihbangun008@gmail.com";

console.log("=================================");
console.log("🧪 TEST EMAIL VERIFIKASI");
console.log("=================================");
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "✅ Ada" : "❌ Kosong");
console.log("Test ke email:", TEST_EMAIL);
console.log("=================================\n");

sendVerificationEmail(TEST_EMAIL)
  .then(() => {
    console.log("\n✅ EMAIL BERHASIL DIKIRIM!");
    console.log("Cek inbox email:", TEST_EMAIL);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ EMAIL GAGAL DIKIRIM!");
    console.error("Error:", error.message);
    console.error("\nKemungkinan penyebab:");
    console.error("1. App Password Gmail belum aktif");
    console.error("2. Email/password di .env salah");
    console.error("3. Koneksi internet bermasalah");
    process.exit(1);
  });
