const { query } = require("../config/database");


/**
 * ======================================
 * PARKIR SCAN (MASUK / KELUAR OTOMATIS)
 * KUOTA PERSONAL
 * 1 PARKIR = MASUK + KELUAR = 1 KUOTA
 * ======================================
 */
const parkirScan = async (req, res) => {
  try {
    const { kode_rfid, gate } = req.body;

    if (!kode_rfid || !gate) {
      return res.json({
        izin: false,
        message: "RFID dan gate wajib dikirim",
      });
    }

    if (!["MASUK", "KELUAR"].includes(gate)) {
      return res.json({
        izin: false,
        message: "Gate tidak valid",
      });
    }

    const uid = kode_rfid.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();

    /* ======================
       1️⃣ VALIDASI RFID
    ====================== */
    const rfid = await query(
      `
      SELECT r.id_kendaraan
      FROM rfid r
      JOIN kendaraan k ON r.id_kendaraan = k.id_kendaraan
      JOIN pengguna p ON k.npm = p.npm
      WHERE r.kode_rfid = ?
        AND r.status_rfid = TRUE
        AND p.status_akun = 1
      LIMIT 1
      `,
      [uid]
    );

    if (rfid.length === 0) {
      return res.json({
        izin: false,
        message: "RFID tidak valid atau akun tidak aktif",
      });
    }

    const id_kendaraan = rfid[0].id_kendaraan;

    /* ======================
       2️⃣ CEK PARKIR AKTIF
    ====================== */
    const logAktif = await query(
      `
      SELECT id_log
      FROM log_parkir
      WHERE id_kendaraan = ?
        AND status_parkir = 'MASUK'
        AND waktu_keluar IS NULL
      LIMIT 1
      `,
      [id_kendaraan]
    );

    const periode = new Date().toISOString().slice(0, 7);

    /* ======================
       MODE KELUAR
    ====================== */
    if (logAktif.length > 0) {
      if (gate !== "KELUAR") {
        return res.json({
          izin: false,
          message: "Silakan keluar melalui gerbang KELUAR",
        });
      }

      const [kuota] = await query(
        `
        SELECT id_kuota
        FROM kuota_parkir
        WHERE id_kendaraan = ?
          AND periode_bulan = ?
        LIMIT 1
        `,
        [id_kendaraan, periode]
      );

      if (!kuota) {
        return res.json({
          izin: false,
          message: "Kuota parkir belum tersedia",
        });
      }

      await query(
        `
        UPDATE log_parkir
        SET waktu_keluar = NOW(),
            status_parkir = 'KELUAR'
        WHERE id_log = ?
        `,
        [logAktif[0].id_log]
      );

      await query("UPDATE slot_parkir SET jumlah = jumlah + 1");

      // ⬅️ HITUNG KUOTA (1 PARKIR SELESAI)
      await query(
        `
        UPDATE kuota_parkir
        SET jumlah_terpakai = jumlah_terpakai + 1
        WHERE id_kuota = ?
        `,
        [kuota.id_kuota]
      );

      return res.json({
        izin: true,
        aksi: "KELUAR",
        servo: 2,
        message: "Silakan keluar",
      });
    }

    /* ======================
       MODE MASUK
    ====================== */
    if (gate !== "MASUK") {
      return res.json({
        izin: false,
        message: "Silakan masuk melalui gerbang MASUK",
      });
    }

    const [slot] = await query("SELECT jumlah FROM slot_parkir LIMIT 1");
    if (!slot || slot.jumlah <= 0) {
      return res.json({
        izin: false,
        message: "Slot parkir penuh",
      });
    }

    const [kuota] = await query(
      `
      SELECT batas_parkir, jumlah_terpakai
      FROM kuota_parkir
      WHERE id_kendaraan = ?
        AND periode_bulan = ?
      LIMIT 1
      `,
      [id_kendaraan, periode]
    );

    if (!kuota) {
      return res.json({
        izin: false,
        message: "Kuota parkir belum tersedia",
      });
    }

    if (kuota.jumlah_terpakai >= kuota.batas_parkir) {
      return res.json({
        izin: false,
        message: "Kuota parkir habis",
      });
    }

    await query(
      `
      INSERT INTO log_parkir
      (id_kendaraan, waktu_masuk, status_parkir)
      VALUES (?, NOW(), 'MASUK')
      `,
      [id_kendaraan]
    );

    await query("UPDATE slot_parkir SET jumlah = jumlah - 1");

    return res.json({
      izin: true,
      aksi: "MASUK",
      servo: 1,
      message: "Silakan masuk",
    });
  } catch (err) {
    console.error("parkirScan:", err);
    return res.status(500).json({
      izin: false,
      message: "Server error",
    });
  }
};


module.exports = {
  parkirScan,
};
