"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // NPM / Nama Admin
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("NPM / Nama Admin dan kata sandi wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // 🔍 Tentukan role
      const isMahasiswa = /^\d+$/.test(identifier);

      // ✅ Endpoint backend Express
      const endpoint = isMahasiswa
        ? "http://localhost:5000/api/login"
        : "http://localhost:5000/api/admin/login";

      const payload = isMahasiswa
        ? { npm: identifier, password }
        : { nama: identifier, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login gagal");
        return;
      }

      /* ================== 🔑 PENTING ================== */
      if (isMahasiswa) {
        // ✅ SIMPAN NPM UNTUK DIGUNAKAN HALAMAN LAIN
        localStorage.setItem("npm", data.data.npm);

        router.push("/mahasiswa");
      } else {
        router.push("/admin");
      }
      /* ================================================= */
    } catch (error) {
      console.error("Login Error:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#1F3A93] bg-white p-6 shadow-md">
        {/* LOGO */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-unila.png"
            alt="Logo Universitas Lampung"
            width={56}
            height={56}
            priority
          />
        </div>

        {/* TITLE */}
        <h2 className="mb-6 text-center text-lg font-semibold text-[#1F3A93]">
          Masuk Sistem
        </h2>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="NPM / Nama Admin"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm
                       focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm
                       focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white
                       transition hover:bg-[#162C6E] disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* LINKS */}
        <div className="mt-4 text-center text-xs">
          <Link
            href="/lupa-password"
            className="text-gray-600 transition hover:text-[#1F3A93] hover:underline"
          >
            Lupa Kata Sandi?
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-gray-700">
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-semibold text-[#1F3A93] hover:underline"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
