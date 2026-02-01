require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectToDatabase } = require("./config/database");

// ROUTES
const penggunaRoutes = require("./routes/penggunaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statistikRoutes = require("./routes/statistikRoutes");

const app = express();

/**
 * ================= BASIC APP CONFIG =================
 */
app.disable("x-powered-by"); // keamanan kecil
app.set("trust proxy", 1); // kalau nanti pakai proxy

/**
 * ================= MIDDLEWARE =================
 */
app.use(
  cors({
    origin: "*", // sesuaikan jika perlu
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ================= DATABASE =================
 */
connectToDatabase();

/**
 * ================= HEALTH CHECK =================
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Server & Database aktif",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ================= ROUTES =================
 */

// MAHASISWA / PENGGUNA
app.use("/api", penggunaRoutes);
// POST /api/login
// POST /api/register

// ADMIN
app.use("/api/admin", adminRoutes);
// POST /api/admin/login
// POST /api/admin/rfid
// dst

// STATISTIK KENDARAAN
app.use("/api/statistik", statistikRoutes);
// GET /api/statistik/kendaraan?periode=harian|mingguan|bulanan

/**
 * ================= 404 HANDLER =================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

/**
 * ================= ERROR HANDLER =================
 */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

/**
 * ================= SERVER =================
 */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});

/**
 * ================= GRACEFUL SHUTDOWN =================
 */
process.on("SIGINT", () => {
  console.log("🛑 Server dihentikan");
  server.close(() => {
    process.exit(0);
  });
});
