const { query } = require("../config/database");

/* =====================================================
 * KF-01 : REGISTRASI PENGGUNA + KENDARAAN
 * (PASSWORD PLAIN - SESUAI PERMINTAAN)
 * ===================================================== */
const registerPengguna = async (req, res) => {
  try {
    const {
      npm,
      nama,
      email,
      angkatan,
      foto,
      password,
      plat_nomor,
      jenis_kendaraan,
      stnk,
    } = req.body;

    if (
      !npm ||
      !nama ||
      !email ||
      !angkatan ||
      !password ||
      !plat_nomor ||
      jenis_kendaraan === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message: "Data akun dan kendaraan wajib diisi",
      });
    }

    // Cek duplikasi akun
    const existing = await query(
      "SELECT npm FROM pengguna WHERE npm = ? OR email = ?",
      [npm, email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "NPM atau email sudah terdaftar",
      });
    }

    const tanggal_daftar = new Date();

    // Insert pengguna
    await query(
      `INSERT INTO pengguna
       (npm, nama, email, angkatan, foto, password, status_akun, tanggal_daftar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        npm,
        nama,
        email,
        angkatan,
        foto || null,
        password, // ⚠️ plain password
        1, // aktif (atau 0 jika pakai verifikasi admin)
        tanggal_daftar,
      ],
    );

    // Insert kendaraan
    await query(
      `INSERT INTO kendaraan
       (npm, plat_nomor, jenis_kendaraan, stnk)
       VALUES (?, ?, ?, ?)`,
      [npm, plat_nomor, jenis_kendaraan, stnk || null],
    );

    return res.status(201).json({
      status: "success",
      message: "Registrasi berhasil",
    });
  } catch (error) {
    console.error("registerPengguna error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* =====================================================
 * KF-02 : LOGIN PENGGUNA
 * ===================================================== */
const loginPengguna = async (req, res) => {
  try {
    const { npm, password } = req.body;

    if (!npm || !password) {
      return res.status(400).json({
        status: "error",
        message: "NPM dan password wajib diisi",
      });
    }

    const rows = await query(
      `SELECT npm, nama, email, angkatan, foto, password, status_akun
       FROM pengguna
       WHERE npm = ?
       LIMIT 1`,
      [npm],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "NPM atau password salah",
      });
    }

    const user = rows[0];

    if (!user.status_akun) {
      return res.status(403).json({
        status: "error",
        message: "Akun belum diverifikasi admin",
      });
    }

    if (password !== user.password) {
      return res.status(401).json({
        status: "error",
        message: "NPM atau password salah",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        npm: user.npm,
        nama: user.nama,
        email: user.email,
        angkatan: user.angkatan,
        foto: user.foto || null,
      },
    });
  } catch (error) {
    console.error("loginPengguna error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* =====================================================
 * KF-13 : EDIT PROFIL PENGGUNA
 * ===================================================== */
const editProfilPengguna = async (req, res) => {
  try {
    const {
      npm,
      nama,
      email,
      angkatan,
      foto,
      plat_nomor,
      jenis_kendaraan,
      stnk,
    } = req.body;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    await query(
      `UPDATE pengguna
       SET nama = ?, email = ?, angkatan = ?, foto = ?
       WHERE npm = ?`,
      [nama, email, angkatan, foto || null, npm],
    );

    await query(
      `UPDATE kendaraan
       SET plat_nomor = ?, jenis_kendaraan = ?, stnk = ?
       WHERE npm = ?`,
      [plat_nomor, jenis_kendaraan, stnk || null, npm],
    );

    return res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
    });
  } catch (error) {
    console.error("editProfilPengguna error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* =====================================================
 * KF-14 : RIWAYAT PARKIR PENGGUNA (FIX TOTAL)
 * ===================================================== */
const riwayatParkirPengguna = async (req, res) => {
  try {
    const { npm } = req.params;

    if (!npm) {
      return res.status(400).json({
        status: "error",
        message: "NPM wajib diisi",
      });
    }

    // 🔥 QUERY FINAL YANG BENAR
    const rows = await query(
      `SELECT
         lp.id_log,
         k.plat_nomor,
         lp.waktu_masuk,
         lp.waktu_keluar,
         COALESCE(lp.status_parkir, 'MASUK') AS status_parkir
       FROM log_parkir lp
       INNER JOIN kendaraan k
         ON lp.id_kendaraan = k.id_kendaraan
       WHERE k.npm = ?
       ORDER BY lp.waktu_masuk DESC`,
      [npm],
    );

    return res.status(200).json({
      status: "success",
      message: "Riwayat parkir pengguna",
      data: rows,
    });
  } catch (error) {
    console.error("riwayatParkirPengguna error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* =====================================================
 * EXPORT
 * ===================================================== */
module.exports = {
  registerPengguna,
  loginPengguna,
  editProfilPengguna,
  riwayatParkirPengguna,
};
