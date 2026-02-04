"use client";

import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import DataKendaraanParkir from "@/app/components/DataKendaraanParkir";

type DashboardSummary = {
  total_slot: number;
  terisi: number;
  tersedia: number;
  pengguna_aktif: number;
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_slot: 0,
    terisi: 0,
    tersedia: 0,
    pengguna_aktif: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/summary", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil data dashboard");
        }

        const json = await res.json();

        if (json.status === "success") {
          setSummary(json.data);
        } else {
          throw new Error(json.message || "Terjadi kesalahan");
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Gagal memuat data dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar & Navbar ditangani oleh admin/layout.tsx */}
      <div className="flex-1 space-y-6">
        {/* ================= STAT CARD ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Slot" value={summary.total_slot} />
          <StatCard title="Terisi" value={summary.terisi} />
          <StatCard title="Tersedia" value={summary.tersedia} />
          <StatCard title="Pengguna Aktif" value={summary.pengguna_aktif} />
        </div>

        {/* ================= STATISTIK ================= */}
        <div className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-5">
          <StatistikKendaraan />
        </div>

        {/* ================= DATA PARKIR ================= */}
        <DataKendaraanParkir />
      </div>
    </div>
  );
}
