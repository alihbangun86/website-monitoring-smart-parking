const db = require("../config/database");

/**
 * =====================================
 * PARKIR MASUK
 * =====================================
 * - Cek kendaraan
 * - Cek kuota parkir
 * - Insert log parkir (MASUK)
 * - Update jumlah_terpakai
 */
const parkirMasuk = async (req, res) => {
  try {
    const { id_kendaraan } = req.body;

    if (!id_kendaraan) {
      return res.status(400).json({
        success: false,
        message: "id_kendaraan wajib diisi",
      });
    }

    // 1️⃣ Ambil kuota aktif (terbaru)
    const kuotaRows = await db.query(
      "SELECT id_kuota, batas_parkir, jumlah_terpakai FROM kuota_parkir ORDER BY id_kuota DESC LIMIT 1",
    );

    if (kuotaRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kuota parkir belum tersedia",
      });
    }

    const { id_kuota, batas_parkir, jumlah_terpakai } = kuotaRows[0];

    // 2️⃣ Cek apakah kuota masih tersedia
    if (jumlah_terpakai >= batas_parkir) {
      return res.status(403).json({
        success: false,
        message: "Kuota parkir penuh",
      });
    }

    // 3️⃣ Cek apakah kendaraan sudah parkir
    const cekLog = await db.query(
      "SELECT id_log FROM log_parkir WHERE id_kendaraan = ? AND status_parkir = 'MASUK'",
      [id_kendaraan],
    );

    if (cekLog.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Kendaraan masih terparkir",
      });
    }

    // 4️⃣ Insert log parkir (MASUK)
    await db.query(
      `INSERT INTO log_parkir (id_kendaraan, waktu_masuk, status_parkir, id_kuota)
       VALUES (?, NOW(), 'MASUK', ?)`,
      [id_kendaraan, id_kuota],
    );

    // 5️⃣ Update jumlah terpakai
    await db.query(
      `UPDATE kuota_parkir
       SET jumlah_terpakai = jumlah_terpakai + 1
       WHERE id_kuota = ?`,
      [id_kuota],
    );

    return res.status(201).json({
      success: true,
      message: "Parkir masuk berhasil",
    });
  } catch (error) {
    console.error("Parkir Masuk Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal proses parkir masuk",
    });
  }
};

/**
 * =====================================
 * PARKIR KELUAR
 * =====================================
 * - Update log parkir (KELUAR)
 * - Kurangi jumlah_terpakai
 */
const parkirKeluar = async (req, res) => {
  try {
    const { id_kendaraan } = req.body;

    if (!id_kendaraan) {
      return res.status(400).json({
        success: false,
        message: "id_kendaraan wajib diisi",
      });
    }

    // 1️⃣ Cari log parkir aktif
    const logRows = await db.query(
      "SELECT id_log, id_kuota FROM log_parkir WHERE id_kendaraan = ? AND status_parkir = 'MASUK'",
      [id_kendaraan],
    );

    if (logRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak sedang parkir",
      });
    }

    const { id_log, id_kuota } = logRows[0];

    // 2️⃣ Update log parkir
    await db.query(
      `UPDATE log_parkir
       SET waktu_keluar = NOW(), status_parkir = 'KELUAR'
       WHERE id_log = ?`,
      [id_log],
    );

    // 3️⃣ Kurangi jumlah terpakai
    await db.query(
      `UPDATE kuota_parkir
       SET jumlah_terpakai = GREATEST(jumlah_terpakai - 1, 0)
       WHERE id_kuota = ?`,
      [id_kuota],
    );

    return res.status(200).json({
      success: true,
      message: "Parkir keluar berhasil",
    });
  } catch (error) {
    console.error("Parkir Keluar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal proses parkir keluar",
    });
  }
};

module.exports = {
  parkirMasuk,
  parkirKeluar,
};
