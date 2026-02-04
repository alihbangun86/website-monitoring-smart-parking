-- =========================
-- DATABASE
-- =========================

show databases;

CREATE DATABASE IF NOT EXISTS parkir_db;

drop database if exists parkir_db;

USE parkir_db;

-- =========================
-- TABEL PENGGUNA
-- =========================
CREATE TABLE pengguna (
    npm VARCHAR (50) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE,
    angkatan VARCHAR(50),
    foto VARCHAR(100),
    password VARCHAR(50) NOT NULL,
    status_akun BOOLEAN DEFAULT TRUE,
    tanggal_daftar DATETIME
);

-- =========================
-- TABEL ADMIN
-- =========================
CREATE TABLE admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL
);

-- =========================
-- TABEL KENDARAAN
-- =========================
CREATE TABLE kendaraan (
    id_kendaraan INT AUTO_INCREMENT PRIMARY KEY,
    npm VARCHAR(50) NOT NULL,
    plat_nomor VARCHAR(20) NOT NULL,
    jenis_kendaraan BOOLEAN,
    stnk VARCHAR(255),
    CONSTRAINT fk_kendaraan_pengguna
        FOREIGN KEY (npm)
        REFERENCES pengguna(npm)
        ON DELETE CASCADE
);

-- =========================
-- TABEL RFID
-- =========================
CREATE TABLE rfid (
    id_rfid INT AUTO_INCREMENT PRIMARY KEY,
    id_kendaraan INT NOT NULL,
    kode_rfid VARCHAR(50) UNIQUE NOT NULL,
    status_rfid BOOLEAN DEFAULT TRUE,
    tanggal_aktif DATETIME,
    CONSTRAINT fk_rfid_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan)
        ON DELETE CASCADE
);

-- =========================
-- TABEL SLOT PARKIR
-- =========================
CREATE TABLE slot_parkir (
    id_slot INT AUTO_INCREMENT PRIMARY KEY,
    jumlah INT,
    id_admin INT,
    CONSTRAINT fk_slot_admin
        FOREIGN KEY (id_admin)
        REFERENCES admin(id_admin)
);

-- =========================
-- TABEL KUOTA PARKIR
-- =========================
CREATE TABLE kuota_parkir (
    id_kuota INT AUTO_INCREMENT PRIMARY KEY,
    batas_parkir INT NOT NULL,
    jumlah_terpakai INT DEFAULT 0,
    id_admin INT,
    CONSTRAINT fk_kuota_admin
        FOREIGN KEY (id_admin)
        REFERENCES admin(id_admin)
);

-- =========================
-- TABEL LOG PARKIR
-- =========================
CREATE TABLE log_parkir (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_kendaraan INT NOT NULL,
    waktu_masuk DATETIME NOT NULL,
    waktu_keluar DATETIME,
    status_parkir ENUM('MASUK','KELUAR') NOT NULL,
    id_kuota INT,
    CONSTRAINT fk_log_kendaraan
        FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan(id_kendaraan),
    CONSTRAINT fk_log_kuota
        FOREIGN KEY (id_kuota)
        REFERENCES kuota_parkir(id_kuota)
);

