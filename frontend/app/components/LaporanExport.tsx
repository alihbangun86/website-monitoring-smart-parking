"use client";

import { useState } from "react";

export default function LaporanExport() {
  const [format, setFormat] = useState<"pdf" | "csv" | "excel">("pdf");
  const [periode, setPeriode] = useState("harian");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = () => {
    if (format !== "pdf") {
      alert("Saat ini hanya PDF yang tersedia");
      return;
    }

    let url = `/api/admin/export/pdf?periode=${periode}`;

    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-800">
        Export Laporan Akhir
      </h3>

      {/* ===== PERIODE ===== */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Periode</label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />
        </div>
      </div>

      {/* ===== FORMAT FILE ===== */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-gray-600">
          Format File
        </label>

        <div className="flex gap-6 text-xs">
          {["pdf", "csv", "excel"].map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="format"
                value={item}
                checked={format === item}
                onChange={() => setFormat(item as any)}
                className="accent-[#1F3A93]"
              />
              {item.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      {/* ===== BUTTON ===== */}
      <button
        type="button"
        onClick={handleExport}
        className="rounded-md bg-[#1F3A93] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#162C6E]"
      >
        Export Laporan
      </button>
    </div>
  );
}
