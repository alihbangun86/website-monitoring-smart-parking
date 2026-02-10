require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectToDatabase } = require("./config/database");

// ================= ROUTES =================
const penggunaRoutes = require("./routes/penggunaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statistikRoutes = require("./routes/statistikRoutes");
const parkirRoutes = require("./routes/parkirRoutes");
const statcardRoutes = require("./routes/statcardRoutes");

const app = express();

/**
 * ================= BASIC CONFIG =================
 */
app.disable("x-powered-by");

/**
 * ================= CORS =================
 */
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js
    credentials: true,
  })
);

/**
 * ================= BODY PARSER =================
 * NOTE:
 * express.json() tetap dipakai
 * tapi upload file harus pakai multer di route, bukan di sini
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

/**
 * ================= REQUEST LOGGER =================
 */
app.use((req, res, next) => {
  console.log("➡️ HIT:", req.method, req.originalUrl);
  next();
});

/**
 * ================= DATABASE =================
 */
connectToDatabase();

/**
 * ================= HEALTH CHECK =================
 */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Server & Database aktif",
    timestamp: new Date(),
  });
});

/**
 * ================= ROUTES =================
 */

// MAHASISWA
app.use("/api/pengguna", penggunaRoutes);

// ADMIN
app.use("/api/admin", adminRoutes);

// PARKIR
app.use("/api/parkir", parkirRoutes);

// STATISTIK
app.use("/api/statistik", statistikRoutes);

// STATCARD
app.use("/api/statcard", statcardRoutes);

/**
 * ================= 404 HANDLER =================
 */
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

/**
 * ================= GLOBAL ERROR HANDLER =================
 */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

/**
 * ================= START SERVER =================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`);
});
