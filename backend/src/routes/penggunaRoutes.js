const express = require("express");
const router = express.Router();

// ================= IMPORT CONTROLLER =================
const {
  registerPengguna,
  loginPengguna,
  editProfilPengguna,
  riwayatParkirPengguna,
} = require("../controllers/penggunaController");

// ====================================================
// ROUTES PENGGUNA
// Base path: /api
// ====================================================

/**
 * ====================================================
 * KF-01 & KF-04
 * Registrasi pengguna + data kendaraan
 * POST /api/register
 * ====================================================
 */
router.post("/register", registerPengguna);

/**
 * ====================================================
 * KF-02
 * Login pengguna
 * POST /api/login
 * ====================================================
 */
router.post("/login", loginPengguna);

/**
 * ====================================================
 * KF-13
 * Edit profil pengguna
 * PUT /api/profil
 * Body: { npm, nama, email, ... }
 * ====================================================
 */
router.put("/profil", editProfilPengguna);

/**
 * ====================================================
 * KF-14
 * Riwayat parkir pengguna
 * GET /api/parkir/riwayat/:npm
 *
 * NOTE:
 * - npm dikirim dari FE (login user)
 * - Siap di-upgrade ke JWT (npm dari token)
 * ====================================================
 */
router.get("/parkir/riwayat/:npm", riwayatParkirPengguna);

// ====================================================

module.exports = router;
