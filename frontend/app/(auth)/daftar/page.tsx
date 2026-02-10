"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ================= DATA JURUSAN & PRODI ================= */

const jurusanList = [
  "Jurusan Teknik Sipil",
  "Jurusan Teknik Mesin",
  "Jurusan Teknik Elektro",
  "Jurusan Teknik Geofisika",
  "Jurusan Teknik Kimia",
  "Jurusan Teknik Geodesi dan Geomatika",
  "Jurusan Teknik Arsitektur",
];

const prodiByJurusan: Record<string, string[]> = {
  "Jurusan Teknik Sipil": [
    "Program Studi S1 Teknik Sipil",
    "Program Studi S1 Teknik Lingkungan",
    "Program Studi Magister Teknik Sipil",
  ],
  "Jurusan Teknik Mesin": [
    "Program Studi S1 Teknik Mesin",
    "Program Studi S1 Terapan Rekayasa Otomotif",
    "Program Studi Magister Teknik Mesin",
    "Program Studi Diploma 3 Teknik Mesin",
  ],
  "Jurusan Teknik Elektro": [
    "Program Studi S1 Teknik Elektro",
    "Program Studi S1 Teknik Informatika",
    "Program Studi Magister Teknik Elektro",
  ],
  "Jurusan Teknik Geofisika": ["Program Studi S1 Teknik Geofisika"],
  "Jurusan Teknik Kimia": ["Program Studi S1 Teknik Kimia"],
  "Jurusan Teknik Geodesi dan Geomatika": [
    "Program Studi S1 Teknik Geodesi",
    "Program Studi Diploma 3 Teknik Survey dan Pemetaan",
  ],
  "Jurusan Teknik Arsitektur": [
    "Program Studi S1 Arsitektur",
    "Program Studi Diploma 3 Arsitek Bangunan Gedung (D3 ABG)",
  ],
};

export default function DaftarPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    npm: "",
    email: "",
    jurusan: "",
    prodi: "",
    password: "",
    plat_nomor: "",
  });

  const [stnk, setStnk] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "jurusan" ? { prodi: "" } : {}),
    }));
  };

  /* ================= HANDLE FILE ================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStnk(file);
    setFileName(file ? file.name : "");
  };

  /* ================= HANDLE SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.nama ||
      !form.npm ||
      !form.email ||
      !form.jurusan ||
      !form.prodi ||
      !form.password ||
      !form.plat_nomor
    ) {
      setError("Semua field wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (stnk) formData.append("stnk", stnk);

      // 🔥 Pakai Next API, bukan langsung backend
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal");
        return;
      }

      router.replace("/daftar/sukses");
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-lg">

        {/* LOGO */}
        <div className="mb-5 flex justify-center">
          <Image
            src="/logo-unila.png"
            alt="Logo"
            width={70}
            height={70}
            className="h-16 w-16"
            priority
          />
        </div>

        <h2 className="mb-5 text-center text-lg sm:text-xl font-bold text-blue-900">
          Registrasi Mahasiswa
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input name="nama" placeholder="Nama Lengkap" value={form.nama} onChange={handleChange} />
          <Input name="npm" placeholder="NPM" value={form.npm} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />

          <Select
            name="jurusan"
            value={form.jurusan}
            onChange={handleChange}
            options={jurusanList}
            placeholder="Pilih Jurusan"
          />

          <Select
            name="prodi"
            value={form.prodi}
            onChange={handleChange}
            options={prodiByJurusan[form.jurusan] || []}
            placeholder="Pilih Program Studi"
            disabled={!form.jurusan}
          />

          <Input name="plat_nomor" placeholder="Plat Nomor" value={form.plat_nomor} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

          {/* FILE UPLOAD */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Upload Foto / Scan STNK
            </label>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full text-xs sm:text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blue-900 file:px-3 file:py-1 file:text-white transition hover:file:bg-blue-800"
            />

            {fileName && (
              <p className="text-xs text-blue-700">
                File dipilih: {fileName}
              </p>
            )}

            <p className="text-[10px] sm:text-xs text-gray-500">
              Format JPG, PNG atau PDF. Pastikan data terlihat jelas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-900 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-95 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="mt-5 text-center text-xs">
          Sudah punya akun?{" "}
          <Link
            href="/"
            className="font-semibold text-blue-900 hover:underline"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Input({ name, type = "text", placeholder, value, onChange }: any) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition hover:border-blue-600 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
    />
  );
}

function Select({ name, value, onChange, options, placeholder, disabled = false }: any) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition hover:border-blue-600 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 disabled:bg-gray-100"
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
