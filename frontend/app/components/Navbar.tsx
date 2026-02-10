"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path ? "font-semibold underline" : "";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // 🔥 Hapus data login dari localStorage
      localStorage.removeItem("npm");
      localStorage.removeItem("user");

      // Redirect ke halaman login
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="w-full border-b border-gray-300 bg-[#1F3A93] text-white">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/logo-unila.png"
            alt="Logo Sistem Monitoring Parkir"
            width={48}
            height={48}
            className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            priority
          />
          <div className="text-xs font-semibold leading-tight sm:text-sm lg:text-base">
            Sistem Monitoring Parkir <br />
            Teknik Geodesi
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
          {/* PROFIL */}
          <Link
            href="/mahasiswa/profil"
            className={`flex items-center gap-1 transition-colors hover:underline ${isActive(
              "/mahasiswa/profil"
            )}`}
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Mahasiswa</span>
          </Link>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 transition-colors hover:text-red-400"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* ================= MENU BAR ================= */}
      <div className="flex gap-4 bg-[#E9EBEE] px-4 py-2 text-xs text-black sm:gap-6 sm:px-6 sm:text-sm">
        <Link
          href="/mahasiswa/informasi-parkir"
          className={`underline-offset-4 transition-colors hover:text-[#1F3A93] hover:underline ${pathname === "/mahasiswa/informasi-parkir"
            ? "font-semibold text-[#1F3A93] underline"
            : ""
            }`}
        >
          Informasi Parkir
        </Link>

        <Link
          href="/mahasiswa/statistik-kendaraan"
          className={`underline-offset-4 transition-colors hover:text-[#1F3A93] hover:underline ${pathname === "/mahasiswa/statistik-kendaraan"
            ? "font-semibold text-[#1F3A93] underline"
            : ""
            }`}
        >
          Statistik Kendaraan
        </Link>
      </div>
    </nav>
  );
}
