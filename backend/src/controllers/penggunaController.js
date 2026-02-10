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
      jurusan,
      prodi,
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

    // Insert pengguna (DITAMBAH jurusan & prodi)
    await query(
      `INSERT INTO pengguna
       (npm, nama, email, jurusan, prodi, angkatan, foto, password, status_akun, tanggal_daftar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        npm,
        nama,
        email,
        jurusan || null,
        prodi || null,
        angkatan,
        foto || null,
        password,
        0,
        tanggal_daftar,
      ],
    );

    // Insert kendaraan (TIDAK DIUBAH)
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
 * KF-02 : LOGIN dan LOG OUT PENGGUNA
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
      `SELECT npm, nama, email, jurusan, prodi, angkatan, foto, password, status_akun
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
        jurusan: user.jurusan,
        prodi: user.prodi,
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

// LOG OUT
const logoutPengguna = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error("logoutPengguna error:", error);
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
      jurusan,
      prodi,
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
       SET nama = ?, email = ?, jurusan = ?, prodi = ?, angkatan = ?, foto = ?
       WHERE npm = ?`,
      [nama, email, jurusan || null, prodi || null, angkatan, foto || null, npm],
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
 * KF-14 : RIWAYAT PARKIR PENGGUNA
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

// lupa password

const { sendOtpEmail } = require("../utils/lupapswd");

/* =====================================================
 * KF-20 : REQUEST OTP RESET PASSWORD
 * ===================================================== */
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email wajib diisi",
      });
    }

    // cek email di tabel pengguna
    const user = await query(
      "SELECT email FROM pengguna WHERE email = ? LIMIT 1",
      [email],
    );

    if (user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Email tidak terdaftar",
      });
    }

    // generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // hapus OTP lama (jika ada)
    await query("DELETE FROM reset_password_otp WHERE email = ?", [email]);

    // simpan OTP baru
    await query(
      "INSERT INTO reset_password_otp (email, otp, expired_at) VALUES (?, ?, ?)",
      [email, otp, expiredAt],
    );

    // kirim OTP via email (SMTP)
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      status: "success",
      message: "OTP berhasil dikirim ke email",
    });
  } catch (error) {
    console.error("requestOtp error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengirim OTP",
    });
  }
};

/* =====================================================
 * KF-22 : RESET PASSWORD DENGAN OTP
 * ===================================================== */
const resetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, password_baru } = req.body;

    if (!email || !otp || !password_baru) {
      return res.status(400).json({
        status: "error",
        message: "Email, OTP, dan password baru wajib diisi",
      });
    }

    // validasi OTP
    const rows = await query(
      `SELECT * FROM reset_password_otp
       WHERE email = ?
       AND otp = ?
       AND expired_at > NOW()
       LIMIT 1`,
      [email, otp],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "OTP tidak valid atau sudah kadaluarsa",
      });
    }

    // update password pengguna
    await query(
      "UPDATE pengguna SET password = ? WHERE email = ?",
      [password_baru, email],
    );

    // hapus OTP setelah dipakai
    await query("DELETE FROM reset_password_otp WHERE email = ?", [email]);

    return res.status(200).json({
      status: "success",
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("resetPasswordOtp error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal reset password",
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
  logoutPengguna,
  requestOtp,
  resetPasswordOtp,
};
