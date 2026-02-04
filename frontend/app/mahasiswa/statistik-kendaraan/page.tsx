"use client";

import { useState } from "react";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";

export default function StatistikKendaraanPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* ===== DESKRIPSI ===== */}
      <div className="rounded-lg bg-gray-200 p-4 text-sm text-gray-700">
        <p>
          Data parkir diperbarui secara real-time untuk membantu pengguna
          mengambil keputusan sebelum memasuki area parkir.
        </p>

        <button
          onClick={handleRefresh}
          className="mt-3 rounded bg-[#1F3A93] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#162C6E]"
        >
          Perbarui Data
        </button>
      </div>

      {/* ===== STATISTIK ===== */}
      <StatistikKendaraan refreshKey={refreshKey} />
    </div>
  );
}
