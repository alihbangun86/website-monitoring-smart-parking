const db = require("../config/database");

const getStatCardParkir = async (req, res) => {
  try {
    const { npm } = req.query;

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
    let batas_parkir = 0;
    if (npm) {
      // Cek kuota individu dulu
      const indivKuota = await db.query(`
        SELECT batas_parkir FROM kuota_parkir 
        WHERE npm = ? 
        ORDER BY id_kuota DESC LIMIT 1
      `, [npm]);

      if (indivKuota.length > 0) {
        batas_parkir = indivKuota[0].batas_parkir;
      } else {
        // Fallback ke global
        const globalKuota = await db.query(`
          SELECT batas_parkir FROM kuota_parkir 
          WHERE npm IS NULL 
          ORDER BY id_kuota DESC LIMIT 1
        `);
        batas_parkir = globalKuota[0]?.batas_parkir || 0;
      }
    } else {
      const globalKuota = await db.query(`
        SELECT batas_parkir FROM kuota_parkir 
        WHERE npm IS NULL 
        ORDER BY id_kuota DESC LIMIT 1
      `);
      batas_parkir = globalKuota[0]?.batas_parkir || 0;
    }

    // ===== JUMLAH TERPAKAI (HITUNG DARI LOG) =====
    let jumlah_terpakai = 0;
    if (npm) {
      const terpakaiRows = await db.query(`
        SELECT COUNT(*) AS jumlah_terpakai
        FROM log_parkir l
        JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
        WHERE k.npm = ?
      `, [npm]);
      jumlah_terpakai = terpakaiRows[0]?.jumlah_terpakai || 0;
    }

    // ===== KESEMPATAN PARKIR (Individual jika NPM ada, else 0/Batas) =====
    const kesempatan_parkir = npm ? Math.max(batas_parkir - jumlah_terpakai, 0) : batas_parkir;

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

