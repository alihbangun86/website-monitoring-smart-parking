const { query } = require("../config/database");
const PDFDocument = require("pdfkit");
const { sendVerificationEmail } = require("../utils/email");

/**
 * =========================
 * HELPER
 * =========================
 */
const normalizeTanggalID = (text = "") =>
  text.replace("Pebruari", "Februari").replace("Ahad", "Minggu");

/**
 * =========================
 * KF-02: LOGIN ADMIN
 * =========================
 */
const loginAdmin = async (req, res) => {
  try {
    const { nama, password } = req.body;

    if (!nama || !password) {
      return res.status(400).json({
        status: "error",
        message: "Nama dan password wajib diisi",
      });
    }

    const [admin] = await query(
      "SELECT id_admin, nama, password FROM admin WHERE nama = ? LIMIT 1",
      [nama]
    );

    if (!admin || admin.password !== password) {
      return res.status(401).json({
        status: "error",
        message: "Nama atau password admin salah",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        id_admin: admin.id_admin,
        nama: admin.nama,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("loginAdmin:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * =========================
 * KF-03: VERIFIKASI AKUN PENGGUNA
 * =========================
 * status_akun:
 * 0 = belum diverifikasi
 * 1 = aktif (boleh login & parkir)
 */
const verifikasiPengguna = async (req, res) => {
  try {
    const { npm } = req.body;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    const user = await query(
      "SELECT email, status_akun FROM pengguna WHERE npm = ?",
      [npm]
    );

    if (user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user[0].status_akun === 1) {
      return res.status(400).json({
        status: "error",
        message: "Akun sudah diverifikasi",
      });
    }

    if (!user[0].email || user[0].email.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Email pengguna tidak ditemukan di database",
      });
    }

    // Aktifkan akun
    await query(
      "UPDATE pengguna SET status_akun = 1 WHERE npm = ?",
      [npm]
    );

    console.log("📧 Mencoba kirim email ke:", user[0].email);

    // Kirim email notifikasi
    try {
      await sendVerificationEmail(user[0].email);
      console.log("✅ Email verifikasi berhasil dikirim");
    } catch (emailError) {
      console.error("❌ Error saat kirim email:", emailError.message);
      
      return res.status(200).json({
        status: "success",
        message: "Akun berhasil diverifikasi, tetapi email gagal dikirim",
        emailError: emailError.message,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Akun berhasil diverifikasi dan email telah dikirim",
      emailSent: true,
    });
  } catch (err) {
    console.error("verifikasiPengguna:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/**
 * =========================
 * KF-04: DATA PENGGUNA (ADMIN)
 * =========================
 */
const getDataPengguna = async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        p.npm,
        p.nama,
        p.status_akun,
        k.plat_nomor
      FROM pengguna p
      LEFT JOIN kendaraan k ON p.npm = k.npm
      ORDER BY p.nama ASC
    `);

    const data = rows.map((r) => ({
      npm: r.npm,
      nama: r.nama,
      plat_nomor: r.plat_nomor,
      status_akun: r.status_akun,
    }));

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    console.error("getDataPengguna:", err);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data pengguna",
    });
  }
};

/**
 * =========================
 * KF-05: GENERATE RFID
 * =========================
 */
const generateRFID = async (req, res) => {
  try {
    const { id_kendaraan, kode_rfid } = req.body;

    if (!id_kendaraan || !kode_rfid) {
      return res.status(400).json({
        status: "error",
        message: "ID kendaraan dan UID RFID wajib dikirim",
      });
    }

    // Normalisasi UID (HEX, uppercase, tanpa spasi)
    const normalizedUID = kode_rfid
      .replace(/[^A-Fa-f0-9]/g, "")
      .toUpperCase();

    if (normalizedUID.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Format UID RFID tidak valid",
      });
    }

    // 1️⃣ Cek UID sudah terdaftar
    const cekUID = await query(
      "SELECT id_rfid FROM rfid WHERE kode_rfid = ? LIMIT 1",
      [normalizedUID]
    );

    if (cekUID.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "UID RFID sudah terdaftar",
      });
    }

    // 2️⃣ Cek kendaraan sudah punya RFID
    const cekKendaraan = await query(
      "SELECT id_rfid FROM rfid WHERE id_kendaraan = ? LIMIT 1",
      [id_kendaraan]
    );

    if (cekKendaraan.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Kendaraan sudah memiliki RFID",
      });
    }

    // 3️⃣ Simpan RFID
    await query(
      `INSERT INTO rfid (id_kendaraan, kode_rfid, status_rfid, tanggal_aktif)
       VALUES (?, ?, TRUE, NOW())`,
      [id_kendaraan, normalizedUID]
    );

    return res.status(201).json({
      status: "success",
      message: "RFID berhasil didaftarkan",
      data: {
        id_kendaraan,
        kode_rfid: normalizedUID,
      },
    });
  } catch (error) {
    console.error("scanDanDaftarRFID:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};




/**
 * =========================
 * KF-06: DASHBOARD SUMMARY
 * =========================
 */
const dashboardSummary = async (req, res) => {
  try {
    const [[slot], [terisi], [pengguna]] = await Promise.all([
      query("SELECT COALESCE(SUM(jumlah),0) AS total FROM slot_parkir"),
      query(
        "SELECT COUNT(*) AS total FROM log_parkir WHERE status_parkir='MASUK'"
      ),
      query("SELECT COUNT(*) AS total FROM pengguna WHERE status_akun=1"),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        total_slot: slot.total,
        terisi: terisi.total,
        tersedia: slot.total - terisi.total,
        pengguna_aktif: pengguna.total,
      },
    });
  } catch (err) {
    console.error("dashboardSummary:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * =========================
 * KF-07: DATA PARKIR (FILTER)
 * =========================
 */
const getDataParkir = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    const start = req.query.start || "";
    const end = req.query.end || "";

    await query("SET lc_time_names = 'id_ID'");

    const where = [];
    const params = [];

    if (search) {
      where.push("(p.nama LIKE ? OR k.plat_nomor LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (start) {
      where.push("DATE(l.waktu_masuk) >= ?");
      params.push(start);
    }

    if (end) {
      where.push("DATE(l.waktu_masuk) <= ?");
      params.push(end);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await query(
      `
      SELECT 
        p.nama,
        k.plat_nomor,
        DATE_FORMAT(l.waktu_masuk,'%d %M %Y') AS tanggal,
        DAYNAME(l.waktu_masuk) AS hari,
        DATE_FORMAT(l.waktu_masuk,'%H:%i') AS masuk,
        DATE_FORMAT(l.waktu_keluar,'%H:%i') AS keluar,
        l.status_parkir
      FROM log_parkir l
      JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
      JOIN pengguna p ON k.npm = p.npm
      ${whereSQL}
      ORDER BY l.waktu_masuk DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const data = rows.map((r, i) => ({
      no: offset + i + 1,
      nama: r.nama,
      plat_motor: r.plat_nomor,
      tanggal: normalizeTanggalID(r.tanggal),
      hari: normalizeTanggalID(r.hari),
      masuk: r.masuk,
      keluar: r.keluar || "-",
      status: r.status_parkir === "MASUK" ? "Terparkir" : "Keluar",
    }));

    return res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error("getDataParkir:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * =========================
 * KF-08: EXPORT DATA PARKIR PDF
 * =========================
 */
const exportParkirPDF = async (req, res) => {
  try {
    await query("SET lc_time_names = 'id_ID'");

    const rows = await query(`
      SELECT 
        p.nama,
        k.plat_nomor,
        DATE_FORMAT(l.waktu_masuk,'%d %M %Y') AS tanggal,
        DATE_FORMAT(l.waktu_masuk,'%H:%i') AS masuk,
        DATE_FORMAT(l.waktu_keluar,'%H:%i') AS keluar,
        l.status_parkir
      FROM log_parkir l
      JOIN kendaraan k ON l.id_kendaraan = k.id_kendaraan
      JOIN pengguna p ON k.npm = p.npm
      ORDER BY l.waktu_masuk DESC
    `);

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=laporan-data-parkir.pdf"
    );

    doc.pipe(res);
    doc.fontSize(16).text("LAPORAN DATA PARKIR", { align: "center" });
    doc.moveDown();

    rows.forEach((r, i) => {
      doc.fontSize(10).text(
        `${i + 1}. ${r.nama} | ${r.plat_nomor} | ${normalizeTanggalID(
          r.tanggal
        )} | ${r.masuk} - ${r.keluar || "-"} | ${r.status_parkir === "MASUK" ? "Terparkir" : "Keluar"
        }`
      );
    });

    doc.end();
  } catch (err) {
    console.error("exportParkirPDF:", err);
    return res.status(500).json({ status: "error", message: "Gagal export PDF" });
  }
};

/**
 * ======================================
 * SET / UPDATE KUOTA PARKIR (ADMIN)
 * ======================================
 * body:
 * {
 *   "id_kendaraan": 1,
 *   "batas_parkir": 30,
 *   "periode_bulan": "2026-02"
 * }
 */
const setKuotaParkir = async (req, res) => {
  try {
    const { id_kendaraan, batas_parkir, periode_bulan } = req.body;

    if (!id_kendaraan || !batas_parkir || !periode_bulan) {
      return res.status(400).json({
        status: "error",
        message: "id_kendaraan, batas_parkir, dan periode_bulan wajib diisi",
      });
    }

    // cek apakah kuota sudah ada
    const existing = await query(
      `SELECT id_kuota FROM kuota_parkir
       WHERE id_kendaraan = ? AND periode_bulan = ?
       LIMIT 1`,
      [id_kendaraan, periode_bulan]
    );

    if (existing.length > 0) {
      // update kuota
      await query(
        `UPDATE kuota_parkir
         SET batas_parkir = ?
         WHERE id_kuota = ?`,
        [batas_parkir, existing[0].id_kuota]
      );

      return res.json({
        status: "success",
        message: "Kuota parkir berhasil diperbarui",
      });
    }

    // insert kuota baru
    await query(
      `INSERT INTO kuota_parkir
       (id_kendaraan, batas_parkir, jumlah_terpakai, periode_bulan)
       VALUES (?, ?, 0, ?)`,
      [id_kendaraan, batas_parkir, periode_bulan]
    );

    return res.status(201).json({
      status: "success",
      message: "Kuota parkir berhasil ditambahkan",
    });
  } catch (err) {
    console.error("setKuotaParkir:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/**
 * ======================================
 * GET KUOTA PARKIR PER KENDARAAN
 * ======================================
 */
const getKuotaKendaraan = async (req, res) => {
  try {
    const { id_kendaraan } = req.params;

    const rows = await query(
      `SELECT
         batas_parkir,
         jumlah_terpakai,
         (batas_parkir - jumlah_terpakai) AS sisa_kuota,
         periode_bulan
       FROM kuota_parkir
       WHERE id_kendaraan = ?
       ORDER BY periode_bulan DESC`,
      [id_kendaraan]
    );

    return res.json({
      status: "success",
      data: rows,
    });
  } catch (err) {
    console.error("getKuotaKendaraan:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};


/**
 * =========================
 * EXPORT
 * =========================
 */
module.exports = {
  loginAdmin,
  verifikasiPengguna,
  getDataPengguna,
  generateRFID,
  dashboardSummary,
  getDataParkir,
  exportParkirPDF,
  setKuotaParkir,
  getKuotaKendaraan,
};
