const cron = require("node-cron");
const { query } = require("../config/database");

console.log("🟢 Cron kuota bulanan aktif...");

// Jalan setiap tanggal 1 jam 00:00
cron.schedule("* * 1 * *", async () => {
  try {
    console.log("🗓️ RESET KUOTA BULANAN:", new Date());

    const now = new Date();
    const periode = now.toISOString().slice(0, 7); // format YYYY-MM

    await query(`
      UPDATE kuota_parkir kp
      JOIN pengguna p ON kp.npm = p.npm
      SET
        kp.periode_bulan = ?,
        kp.batas_parkir = 30,
        kp.jumlah_terpakai = 0,
        kp.last_reset_date = CURDATE()
      WHERE p.status_akun = 1
      AND kp.periode_bulan != ?
    `, [periode, periode]);

    console.log("✅ Kuota berhasil direset untuk bulan baru");

  } catch (err) {
    console.error("❌ Gagal reset kuota:", err);
  }
});