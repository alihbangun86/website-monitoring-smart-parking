"use client";

import Image from "next/image";
import Link from "next/link";
import { UserCog, LogOut, Menu, X, BarChart3, Users, ParkingCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path
      ? "bg-[#1F3A93] text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-[#1F3A93]";

  useEffect(() => {
    const handleResize = () => {
      // Auto close drawer if screen becomes large enough (desktop mode)
      if (window.innerWidth >= 640) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("admin");
    localStorage.removeItem("admin_id");
    router.replace("/");
  };

  const menuItems = [
    { href: "/admin", icon: <BarChart3 size={20} />, label: "Dashboard" },
    {
      href: "/admin/statistik-pengguna",
      icon: <BarChart3 size={20} />,
      label: "Statistik Pengguna",
    },
    {
      href: "/admin/pengguna-parkir",
      icon: <Users size={20} />,
      label: "Pengguna Parkir",
    },
    {
      href: "/admin/data-parkir",
      icon: <ParkingCircle size={20} />,
      label: "Data Parkir",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#1F3A93] text-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">

          {/* HAMBURGER MENU BUTTON */}
          {/* HANYA MUNCUL DI LAYAR SANGAT KECIL (MOBILE < 640px) */}
          <button
            className="block sm:hidden p-1 rounded hover:bg-[#344FA0] transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Image
            src="/logo-unila.png"
            alt="Logo Sistem Monitoring Parkir"
            width={44}
            height={44}
            className="h-8 w-8 sm:h-10 sm:w-10"
            priority
          />

          <div className="text-xs font-semibold leading-tight sm:text-sm">
            Sistem Monitoring Parkir <br />
            Teknik Geodesi
          </div>
        </div>

        {/* RIGHT SECTION - DESKTOP ONLY (sm+) */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <UserCog size={18} />
            <span>Admin</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (sm hidden) */}
      {isOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white text-black shadow-lg border-b py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2">

          <div className="flex items-center gap-2 px-4 py-2 mb-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
            <UserCog size={16} />
            <span className="font-semibold">Logged in as Admin</span>
          </div>

          <hr className="border-gray-100 mb-2" />

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(
                item.href
              )}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <hr className="my-2 border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition w-full text-left"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      )}
    </nav>
  );
}
