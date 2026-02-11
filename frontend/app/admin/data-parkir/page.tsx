"use client";

import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";
import DataKendaraanParkir from "@/app/components/DataKendaraanParkir";

type DashboardSummary = {
  total_slot: number;
  terisi: number;
  tersedia: number;
};

export default function DataParkirAdminPage() {
  // ================= STATE =================
  const [summary, setSummary] = useState<DashboardSummary>({
    total_slot: 0,
    terisi: 0,
    tersedia: 0,
  });

  const [loadingSummary, setLoadingSummary] = useState(true);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ================= FETCH SUMMARY =================
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/summary", {
          cache: "no-store",
        });

        const json = await res.json();

        if (res.ok && json.status === "success") {
          setSummary(json.data);
        }
      } catch (err) {
        console.error("FETCH SUMMARY ERROR:", err);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* ================= STAT CARD ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Slot"
          value={summary.total_slot}
          loading={loadingSummary}
        />
        <StatCard
          title="Terisi"
          value={summary.terisi}
          loading={loadingSummary}
        />
        <StatCard
          title="Tersedia"
          value={summary.tersedia}
          loading={loadingSummary}
        />
      </div>

      {/* ================= FILTER ================= */}
      <section className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* SEARCH */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Cari Nama / Nomor Kendaraan
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama / Nomor Kendaraan"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
            />
          </div>

          {/* TANGGAL MULAI */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
            />
          </div>

          {/* TANGGAL SAMPAI */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Tanggal Sampai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
            />
          </div>
        </div>
      </section>

      {/* ================= DATA PARKIR ================= */}
      <DataKendaraanParkir
        search={search}
        startDate={startDate}
        endDate={endDate}
      />

      {/* ================= SPACER ================= */}
      <div className="h-10" />
    </div>
  );
}
