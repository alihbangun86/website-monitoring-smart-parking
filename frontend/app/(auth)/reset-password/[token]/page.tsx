"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError("Semua field wajib diisi");
      return;
    }

    if (password !== confirm) {
      setError("Kata Sandi tidak sama");
      return;
    }

    const email = sessionStorage.getItem("reset_email");
    if (!email) {
      setError("Sesi kadaluarsa, silakan ulang dari awal");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: token,
          password_baru: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal reset Kata Sandi");
      }

      sessionStorage.removeItem("reset_email");

      router.push("/lupa-password/sukses");
    } catch (err: any) {
      setError(err.message || "Gagal reset Kata Sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EBEE] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F3A93] bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-unila.png" alt="Logo" width={60} height={60} />
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold text-[#1F3A93]">
          Reset Kata Sandi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi Baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-sm focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#1F3A93] focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Konfirmasi Kata Sandi"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-sm focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#1F3A93] focus:outline-none"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#1F3A93] py-2 text-sm font-semibold text-white hover:bg-[#162C6E] disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
