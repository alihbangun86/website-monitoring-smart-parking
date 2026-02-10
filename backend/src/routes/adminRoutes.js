const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  verifikasiPengguna,   // update status_akun (hak parkir)
  getDataPengguna,      // 🔥 LIST PENGGUNA
  generateRFID,
  dashboardSummary,
  getDataParkir,
  exportParkirPDF,
  setKuotaParkir,
  getKuotaKendaraan
} = require("../controllers/adminController");

/**
 * =========================
 * AUTH ADMIN
 * =========================
 */

// LOGIN ADMIN
router.post("/login", loginAdmin);

router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email wajib diisi"
      });
    }

    console.log("🧪 TEST: Mengirim email ke:", email);
    
    const { sendVerificationEmail } = require("../utils/email");
    await sendVerificationEmail(email);
    
    res.json({
      status: "success",
      message: "Email test berhasil dikirim",
      email: email
    });
  } catch (error) {
    console.error("❌ TEST EMAIL GAGAL:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengirim email test",
      error: error.message
    });
  }
});

/**
 * =========================
 * MANAJEMEN PENGGUNA
 * =========================
 * status_akun:
 * 1 = boleh parkir
 * 0 = diblokir parkir
 * null = menunggu validasi
 */

// 🔥 AMBIL SEMUA DATA PENGGUNA
router.get("/pengguna", getDataPengguna);

// 🔥 AKTIFKAN / BLOKIR HAK PARKIR
router.put("/pengguna/status", verifikasiPengguna);

// 🔥 HAPUS PENGGUNA
router.delete("/pengguna/:npm", async (req, res) => {
  try {
    const { npm } = req.params;

    const result = await require("../config/database").query(
      "DELETE FROM pengguna WHERE npm = ?",
      [npm]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan",
      });
    }

    res.json({
      status: "success",
      message: "Pengguna berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE USER:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal menghapus pengguna",
    });
  }
});

/**
 * =========================
 * RFID
 * =========================
 */

// GENERATE RFID
router.post("/rfid", generateRFID);

/**
 * =========================
 * DASHBOARD ADMIN
 * =========================
 */

// SUMMARY DASHBOARD
router.get("/dashboard/summary", dashboardSummary);

/**
 * =========================
 * DATA PARKIR
 * =========================
 */

// TABEL DATA PARKIR
router.get("/parkir", getDataParkir);

// EXPORT DATA PARKIR KE PDF
router.get("/parkir/export/pdf", exportParkirPDF);

// SET / UPDATE KUOTA (ADMIN)
router.post("/kuota", setKuotaParkir);

// GET KUOTA PER KENDARAAN
router.get("/kuota/:id_kendaraan", getKuotaKendaraan);


module.exports = router;
