const { query } = require("../config/database");


/* PARKIR SCAN (MASUK / KELUAR OTOMATIS)
 * KUOTA PERSONAL
 * 1 PARKIR = MASUK + KELUAR = 1 KUOTA */
const parkirScan = async (req, res) => {
  try {
    const { kode_rfid, gate } = req.body;
    console.log(`SCAN RECEIVED: RFID=${kode_rfid}, Gate=${gate}`);

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

    const uid = kode_rfid.trim().toUpperCase();
    console.log("Cleaned RFID UID:", uid);

    /* ======================
       1️⃣ VALIDASI RFID
    ====================== */
    const rfidQuery = `
      SELECT r.id_kendaraan, k.npm, r.status_rfid, p.status_akun
      FROM rfid r
      JOIN kendaraan k ON r.id_kendaraan = k.id_kendaraan
      JOIN pengguna p ON k.npm = p.npm
      WHERE r.kode_rfid = ?
      LIMIT 1
    `;

    console.log("Executing RFID validation query with UID:", uid);
    const rfid = await query(rfidQuery, [uid]);

    console.log("RFID Query Result:", rfid);

    if (rfid.length === 0) {
      console.error("RFID not found in database");
      return res.json({
        izin: false,
        message: "RFID tidak valid atau akun tidak aktif",
      });
    }

    // Check individual conditions
    const rfidData = rfid[0];
    console.log("RFID Data:", {
      id_kendaraan: rfidData.id_kendaraan,
      npm: rfidData.npm,
      status_rfid: rfidData.status_rfid,
      status_akun: rfidData.status_akun
    });

    if (!rfidData.status_rfid) {
      console.error("RFID is not active (status_rfid = false)");
      return res.json({
        izin: false,
        message: "RFID tidak aktif",
      });
    }

    if (rfidData.status_akun !== 1) {
      console.error("User account is not active (status_akun != 1)");
      return res.json({
        izin: false,
        message: "Akun pengguna tidak aktif",
      });
    }

    const { id_kendaraan, npm } = rfid[0];

    /*CEK PARKIR AKTIF*/
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

    /*MODE KELUAR*/
    if (logAktif.length > 0) {
      if (gate !== "KELUAR") {
        return res.json({
          izin: false,
          message: "Silakan keluar melalui gerbang KELUAR",
        });
      }

      let [kuota] = await query(
        `
        SELECT id_kuota
        FROM kuota_parkir
        WHERE id_kendaraan = ?
          AND periode_bulan = ?
        LIMIT 1
        `,
        [id_kendaraan, periode]
      );

      // Jika kuota bulan ini belum ada, cari kuota dasar dari admin (npm) dan buat record bulanan
      if (!kuota) {
        const [baseKuota] = await query(
          "SELECT batas_parkir FROM kuota_parkir WHERE npm = ? AND periode_bulan IS NULL ORDER BY id_kuota DESC LIMIT 1",
          [npm]
        );

        if (!baseKuota) {
          return res.json({ izin: false, message: "Kuota belum diatur oleh admin" });
        }

        const result = await query(
          "INSERT INTO kuota_parkir (id_kendaraan, npm, periode_bulan, batas_parkir, jumlah_terpakai) VALUES (?, ?, ?, ?, 0)",
          [id_kendaraan, npm, periode, baseKuota.batas_parkir]
        );

        kuota = { id_kuota: result.insertId };
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

      // Emit update real-time
      const io = req.app.get("io");
      if (io) {
        console.log("Emitting parking_update (KELUAR):", { action: "KELUAR", id_kendaraan });
        io.emit("parking_update", { action: "KELUAR", id_kendaraan });
      } else {
        console.error("Socket.io instance not found!");
      }

      return res.json({
        izin: true,
        aksi: "KELUAR",
        servo: 2,
        message: "Silakan keluar",
      });
    }

    /* MODE MASUK */
    if (gate !== "MASUK") {
      return res.json({
        izin: false,
        message: "Silakan masuk melalui gerbang MASUK",
      });
    }

    //CHECK SLOT AVAILABILITY
    const [slotResults, terisiResults] = await Promise.all([
      query("SELECT COALESCE(SUM(jumlah), 0) AS total FROM slot_parkir"),
      query("SELECT COUNT(*) AS total FROM log_parkir WHERE status_parkir = 'MASUK'"),
    ]);

    const total_slot = slotResults[0]?.total || 0;
    const terisi_current = terisiResults[0]?.total || 0;
    const tersedia = total_slot - terisi_current;

    if (tersedia <= 0) {
      return res.json({
        izin: false,
        message: "Slot parkir penuh",
      });
    }

    let [kuota] = await query(
      `
      SELECT id_kuota, batas_parkir, jumlah_terpakai
      FROM kuota_parkir
      WHERE id_kendaraan = ?
        AND periode_bulan = ?
      LIMIT 1
      `,
      [id_kendaraan, periode]
    );

    // Jika kuota bulan ini belum ada, cari kuota dasar dari admin (npm) dan buatkan record bulanan
    if (!kuota) {
      const [baseKuota] = await query(
        "SELECT batas_parkir FROM kuota_parkir WHERE npm = ? AND periode_bulan IS NULL ORDER BY id_kuota DESC LIMIT 1",
        [npm]
      );

      if (!baseKuota) {
        return res.json({ izin: false, message: "Kuota belum diatur oleh admin" });
      }

      const result = await query(
        "INSERT INTO kuota_parkir (id_kendaraan, npm, periode_bulan, batas_parkir, jumlah_terpakai) VALUES (?, ?, ?, ?, 0)",
        [id_kendaraan, npm, periode, baseKuota.batas_parkir]
      );

      kuota = {
        id_kuota: result.insertId,
        batas_parkir: baseKuota.batas_parkir,
        jumlah_terpakai: 0
      };
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

    //HITUNG KUOTA (PENGGUNAAN DIMULAI SAAT MASUK)
    await query(
      `
      UPDATE kuota_parkir
      SET jumlah_terpakai = jumlah_terpakai + 1
      WHERE id_kuota = ?
      `,
      [kuota.id_kuota]
    );

    // Emit update real-time
    const io = req.app.get("io");
    if (io) {
      console.log("Emitting parking_update (MASUK):", { action: "MASUK", id_kendaraan, npm });
      io.emit("parking_update", { action: "MASUK", id_kendaraan, npm });
    } else {
      console.error("Socket.io instance not found!");
    }

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
