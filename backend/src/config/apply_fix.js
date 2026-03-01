const { query } = require("./database");

async function applyFix() {
    try {
        console.log("Starting database fix...");

        // Tambah kolom id_kendaraan jika belum ada
        const colKendaraan = await query("SHOW COLUMNS FROM kuota_parkir LIKE 'id_kendaraan'");
        if (colKendaraan.length === 0) {
            await query("ALTER TABLE kuota_parkir ADD COLUMN id_kendaraan INT NULL");
            console.log("Kolom id_kendaraan ditambahkan");
        }

        // 2. Tambah kolom periode_bulan jika belum ada
        const colPeriode = await query("SHOW COLUMNS FROM kuota_parkir LIKE 'periode_bulan'");
        if (colPeriode.length === 0) {
            await query("ALTER TABLE kuota_parkir ADD COLUMN periode_bulan VARCHAR(7) NULL");
            console.log("Kolom periode_bulan ditambahkan");
        }

        // 3. Update batas_parkir jadi default 0
        await query("ALTER TABLE kuota_parkir MODIFY COLUMN batas_parkir INT NOT NULL DEFAULT 0");
        console.log("Kolom batas_parkir diperbarui (Default 0)");

        // 4. Tambah Foreign Key id_kendaraan
        try {
            await query("ALTER TABLE kuota_parkir ADD CONSTRAINT fk_kuota_kendaraan FOREIGN KEY (id_kendaraan) REFERENCES kendaraan(id_kendaraan) ON DELETE CASCADE");
            console.log("Foreign Key fk_kuota_kendaraan ditambahkan");
        } catch (e) {
            console.log("Foreign Key mungkin sudah ada");
        }

        // 5. Tambah Unique Key (id_kendaraan, periode_bulan)
        try {
            await query("ALTER TABLE kuota_parkir ADD UNIQUE INDEX idx_kuota_bulanan (id_kendaraan, periode_bulan)");
            console.log("Unique Index idx_kuota_bulanan ditambahkan");
        } catch (e) {
            console.log("Unique Index mungkin sudah ada");
        }

        console.log("Semua perubahan berhasil diterapkan!");
    } catch (err) {
        console.error("Terjadi kesalahan:", err.message);
    } finally {
        process.exit();
    }
}

applyFix();
