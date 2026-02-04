const db = require("../config/database");

const getStatCardParkir = async (req, res) => {
  try {
    // ===== TOTAL SLOT PARKIR (FISIK) =====
    const slotRows = await db.query(`
      SELECT SUM(jumlah) AS total_slot
      FROM slot_parkir
    `);
    const total_slot = slotRows[0]?.total_slot || 0;

    // ===== TERISI (KENDARAAN SEDANG PARKIR) =====
    const terisiRows = await db.query(`
      SELECT COUNT(*) AS terisi
      FROM log_parkir
      WHERE status_parkir = 'MASUK'
    `);
    const terisi = terisiRows[0]?.terisi || 0;

    // ===== TERSEDIA (SLOT FISIK) =====
    const tersedia = Math.max(total_slot - terisi, 0);

    // ===== BATAS PARKIR (KEBIJAKAN ADMIN) =====
    const kuotaRows = await db.query(`
      SELECT batas_parkir
      FROM kuota_parkir
      ORDER BY id_kuota DESC
      LIMIT 1
    `);
    const batas_parkir = kuotaRows[0]?.batas_parkir || 0;

    // ===== JUMLAH TERPAKAI (HITUNG DARI LOG) =====
    const terpakaiRows = await db.query(`
      SELECT COUNT(*) AS jumlah_terpakai
      FROM log_parkir
    `);
    const jumlah_terpakai = terpakaiRows[0]?.jumlah_terpakai || 0;

    // ===== KESEMPATAN PARKIR (KUOTA) =====
    const kesempatan_parkir = Math.max(batas_parkir - jumlah_terpakai, 0);

    // ===== RESPONSE =====
    res.json({
      success: true,
      data: {
        terisi,
        tersedia,
        kesempatan_parkir,
      },
    });
  } catch (error) {
    console.error("StatCard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data statcard",
    });
  }
};

module.exports = { getStatCardParkir };
