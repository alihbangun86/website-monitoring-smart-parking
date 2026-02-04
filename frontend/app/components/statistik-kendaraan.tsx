"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Periode = "harian" | "mingguan" | "bulanan";

/* 🔑 TAMBAH PROP REFRESH */
type StatistikKendaraanProps = {
  refreshKey?: number;
};

export default function StatistikKendaraan({
  refreshKey = 0,
}: StatistikKendaraanProps) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchStatistik = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/statistik/kendaraan?periode=${periode}`, {
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data statistik");
        }

        if (!Array.isArray(result.labels) || !Array.isArray(result.data)) {
          throw new Error("Format data statistik tidak valid");
        }

        setLabels(result.labels);
        setValues(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistik();
  }, [periode, refreshKey]); // 🔥 INI KUNCI AUTO REFRESH

  const chartData = {
    labels,
    datasets: [
      {
        label: "Jumlah Kendaraan",
        data: values,
        backgroundColor: "#1F3A93",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="rounded-lg bg-gray-200 p-4">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Statistik Kendaraan</h3>

        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value as Periode)}
          className="rounded border px-2 py-1 text-xs"
        >
          <option value="harian">Harian (Per Jam)</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="h-[320px]">
        {loading && (
          <p className="text-center text-xs text-gray-500">
            Memuat data statistik...
          </p>
        )}

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        {!loading && !error && labels.length > 0 && (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.parsed.y} kendaraan`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Jumlah Kendaraan",
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
