"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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

interface FormState {
  nama: string;
  npm: string;
  email: string;
  jurusan: string;
  prodi: string;
  password: string;
  plat_nomor: string;
  [key: string]: string;
}

export default function DaftarPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
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
  const [showPassword, setShowPassword] = useState(false);



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (error) setError("");

    setForm((prev: FormState) => ({
      ...prev,
      [name]: value,
      ...(name === "jurusan" ? { prodi: "" } : {}),
    }));
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > 2 * 1024 * 1024) {
      setError("Ukuran file STNK maksimal 2MB. Tidak bisa menyimpan perubahan.");
      e.target.value = "";
      setStnk(null);
      setFileName("");
      return;
    }

    setError("");

    setStnk(file);
    setFileName(file ? file.name : "");
  };


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
      !form.plat_nomor ||
      !stnk
    ) {
      setError("Semua field wajib diisi");
      return;
    }

    if (form.password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Format email tidak valid");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (stnk) formData.append("stnk", stnk);

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

        <h2 className="mb-2 text-center text-lg sm:text-xl font-bold text-blue-900">
          Daftar Mahasiswa
        </h2>
        <p className="mb-5 text-center text-xs text-gray-600">
          Sistem Monitoring Parkir Teknik Geodesi
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input required name="nama" placeholder="Nama Lengkap" value={form.nama} onChange={handleChange} />
          <Input required name="npm" placeholder="NPM" value={form.npm} onChange={handleChange} />
          <Input required name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />

          <Select
            required
            name="jurusan"
            value={form.jurusan}
            onChange={handleChange}
            options={jurusanList}
            placeholder="Pilih Jurusan"
          />
          <Select
            required
            name="prodi"
            value={form.prodi}
            onChange={handleChange}
            options={prodiByJurusan[form.jurusan] || []}
            placeholder="Pilih Program Studi"
            disabled={!form.jurusan}
          />
          <Input required name="plat_nomor" placeholder="Nomor Kendaraan (Contoh: BE 1234 ABC)" value={form.plat_nomor} onChange={handleChange} />
          <Input
            required
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Kata Sandi"
            value={form.password}
            onChange={handleChange}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-blue-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Upload Foto / Scan STNK <span className="text-red-500">*</span>
            </label>

            <input
              required={!stnk}
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
              Format JPG, PNG atau PDF. Maksimal 2MB. Pastikan data terlihat jelas.
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

interface InputProps {
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
}

function Input({ name, type = "text", placeholder, value, onChange, required, icon }: InputProps) {
  return (
    <div className="relative">
      <input
        required={required}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition hover:border-blue-600 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 ${icon ? "pr-10" : ""
          }`}
      />
      {icon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {icon}
        </div>
      )}
    </div>
  );
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}

function Select({ name, value, onChange, options, placeholder, disabled = false, required }: SelectProps) {
  return (
    <div className="relative">
      <select
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-full border border-gray-300 px-4 py-2 pr-10 text-sm transition hover:border-blue-600 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
