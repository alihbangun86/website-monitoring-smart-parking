const { query } = require("./database");

async function migrate() {
    try {
        console.log("Starting migration...");
        // Cek apakah kolom npm sudah ada
        const columns = await query("SHOW COLUMNS FROM kuota_parkir LIKE 'npm'");
        if (columns.length === 0) {
            await query("ALTER TABLE kuota_parkir ADD COLUMN npm VARCHAR(50) DEFAULT NULL");
            console.log("✅ Added npm column");
        } else {
            console.log("ℹ️ Column npm already exists");
        }

        // Cek constraint
        try {
            await query("ALTER TABLE kuota_parkir ADD CONSTRAINT fk_kuota_pengguna FOREIGN KEY (npm) REFERENCES pengguna(npm) ON DELETE CASCADE");
            console.log("✅ Added foreign key constraint");
        } catch (e) {
            console.log("ℹ️ Constraint might already exist:", e.message);
        }

        console.log("🚀 Migration successful!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        process.exit();
    }
}

migrate();
