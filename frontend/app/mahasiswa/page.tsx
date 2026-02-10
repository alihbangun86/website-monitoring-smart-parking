"use client";

import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";
import StatistikKendaraan from "@/app/components/statistik-kendaraan";

type StatCardData = {
  terisi: number;
  tersedia: number;
  kesempatan_parkir: number;
};

export default function MahasiswaHomePage() {
  const [loading, setLoading] = useState(true);
  const [statcard, setStatcard] = useState<StatCardData>({
    terisi: 0,
    tersedia: 0,
    kesempatan_parkir: 0,
  });

  /* ================= FETCH STATCARD ================= */
  const fetchStatCard = async () => {
    try {
      setLoading(true);

      // ✅ LEWAT API NEXT.JS (Bukan langsung backend)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/statcard/parkir`, {
        cache: "no-store",
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatcard(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil statcard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatCard();
  }, []);

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <h2 className="text-lg font-semibold text-gray-800">Dashboard Parkir</h2>

      {/* ================= STATCARD ================= */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Terisi"
          value={statcard.terisi}
          unit="Kendaraan"
          loading={loading}
        />
        <StatCard
          title="Tersedia"
          value={statcard.tersedia}
          unit="Slot"
          loading={loading}
        />
        <StatCard
          title="Kesempatan Parkir"
          value={statcard.kesempatan_parkir}
          unit="Slot"
          loading={loading}
        />
      </section>

      {/* ================= GRAFIK STATISTIK ================= */}
      <section>
        <StatistikKendaraan />
      </section>
    </div>
  );
}
