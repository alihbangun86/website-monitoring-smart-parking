"use client";

import { useEffect, useState } from "react";
import StatCard from "@/app/components/StatCard";

/* ===== TIPE DATA RIWAYAT ===== */
type RiwayatMasuk = {
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  status: "Masuk" | "Keluar";
};

/* ===== TIPE DATA STATCARD ===== */
type StatCardData = {
  terisi: number;
  tersedia: number;
  kesempatan_parkir: number;
};

export default function InformasiParkirPage() {
  const [loading, setLoading] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const [statcard, setStatcard] = useState<StatCardData>({
    terisi: 0,
    tersedia: 0,
    kesempatan_parkir: 0,
  });

  const [riwayat, setRiwayat] = useState<RiwayatMasuk[]>([]);

  /* ================= STATCARD ================= */
  const fetchStatCard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/statcard/parkir", {
        cache: "no-store",
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatcard(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil statcard:", error);
    }
  };

  /* ================= RIWAYAT PARKIR ================= */
  const fetchRiwayatParkir = async () => {
    try {
      const npm = localStorage.getItem("npm");

      if (!npm) {
        setRiwayat([]);
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/parkir/riwayat/${npm}`,
        { cache: "no-store" },
      );

      const result = await res.json();

      if (res.ok && result.status === "success") {
        const mapped: RiwayatMasuk[] = result.data.map((item: any) => ({
          tanggal: new Date(item.waktu_masuk).toLocaleDateString("id-ID"),
          waktuMasuk: new Date(item.waktu_masuk).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          waktuKeluar: item.waktu_keluar
            ? new Date(item.waktu_keluar).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
          status: item.status_parkir === "MASUK" ? "Masuk" : "Keluar",
        }));

        setRiwayat(mapped);
      } else {
        setRiwayat([]);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat parkir:", error);
      setRiwayat([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchStatCard();
    fetchRiwayatParkir();
  }, []);

  /* ================= REFRESH ================= */
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStatCard(), fetchRiwayatParkir()]);
    setLoading(false);
  };

  const statusParkir = statcard.tersedia === 0 ? "Penuh" : "Tersedia";

  return (
    <div className="space-y-8">
      {/* STATUS PARKIR */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-gray-700">Status Parkir:</span>
        <span
          className={`rounded px-3 py-1 text-xs font-semibold text-white ${
            statusParkir === "Penuh" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {statusParkir}
        </span>
      </div>

      {/* STATCARD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Ketersediaan Parkir
          </h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded bg-[#1F3A93] px-4 py-1.5 text-xs font-semibold text-white"
          >
            {loading ? "Memperbarui..." : "Perbarui Data"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Terisi" value={statcard.terisi} unit="Kendaraan" />
          <StatCard title="Tersedia" value={statcard.tersedia} unit="Slot" />
          <StatCard
            title="Kesempatan Parkir"
            value={statcard.kesempatan_parkir}
            unit="Slot"
          />
        </div>
      </section>

      {/* RIWAYAT PARKIR */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">
          Riwayat Parkir Anda
        </h3>

        {loadingRiwayat ? (
          <p className="text-xs text-gray-500">Memuat riwayat...</p>
        ) : riwayat.length > 0 ? (
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <Th>Tanggal</Th>
                <Th>Waktu Masuk</Th>
                <Th>Waktu Keluar</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((item, index) => (
                <tr key={index} className="border-t text-center">
                  <Td>{item.tanggal}</Td>
                  <Td>{item.waktuMasuk}</Td>
                  <Td>{item.waktuKeluar ?? "-"}</Td>
                  <Td>{item.status}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-gray-500">Belum ada riwayat parkir</p>
        )}
      </section>
    </div>
  );
}

/* ===== TABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-xs font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-xs">{children}</td>;
}
