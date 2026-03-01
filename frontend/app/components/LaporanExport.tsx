"use client";

import { useState, useEffect } from "react";

export default function LaporanExport() {
  const [format, setFormat] = useState<"pdf" | "csv" | "excel">("pdf");
  const [periode, setPeriode] = useState("harian");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateError, setDateError] = useState("");

  const getDaysDifference = (date1: string, date2: string) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!from || !to) {
      setDateError("");
      return;
    }

    const daysDiff = getDaysDifference(from, to);

    if (periode === "harian" && daysDiff !== 0) {
      setDateError("Periode harian hanya untuk 1 hari yang sama");
    } else if (periode === "mingguan" && daysDiff !== 6) {
      setDateError("Periode mingguan harus tepat 7 hari (6 hari selisih)");
    } else if (periode === "bulanan" && daysDiff !== 29) {
      setDateError("Periode bulanan harus tepat 30 hari (29 hari selisih)");
    } else {
      setDateError("");
    }
  }, [from, to, periode]);

  const handleFromDateChange = (date: string) => {
    setFrom(date);

    if (!date) {
      setTo("");
      return;
    }

    const startDate = new Date(date);
    let endDate = new Date(date);

    if (periode === "harian") {
      // Sama dengan tanggal mulai
      endDate = new Date(date);
    } else if (periode === "mingguan") {
      // Tambah 6 hari (total 7 hari)
      endDate.setDate(startDate.getDate() + 6);
    } else if (periode === "bulanan") {
      // Tambah 29 hari (total 30 hari)
      endDate.setDate(startDate.getDate() + 29);
    }

    const endDateString = endDate.toISOString().split('T')[0];
    setTo(endDateString);
  };

  const handleExport = async () => {
    if (dateError) {
      alert("Silakan perbaiki rentang tanggal terlebih dahulu");
      return;
    }

    if (!from || !to) {
      alert("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    if (format === "pdf") {
      try {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        // Fetch data mentah
        const url = `/api/admin/parkir?limit=100000&start=${from}&end=${to}`;
        const res = await fetch(url);
        const json = await res.json();
        const dataParkir = json.data || [];

        if (dataParkir.length === 0) {
          alert("Tidak ada data untuk periode ini");
          return;
        }

        const doc = new jsPDF() as any;
        doc.text("LAPORAN DATA PARKIR", 14, 15);
        doc.setFontSize(10);
        doc.text(`Periode: ${from} s/d ${to}`, 14, 22);

        const tableData = dataParkir.map((item: any, index: number) => [
          index + 1,
          item.npm || "-",
          item.nama,
          item.plat_motor,
          item.tanggal,
          item.hari,
          item.masuk,
          item.keluar || "-",
          item.status
        ]);

        const columns = ["No", "NPM", "Nama", "Plat", "Tanggal", "Hari", "Masuk", "Keluar", "Status"];

        autoTable(doc, {
          head: [columns],
          body: tableData,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [31, 58, 147] }
        });

        doc.save(`laporan-parkir-${from}.pdf`);
      } catch (err) {
        console.error("PDF ERROR:", err);
        alert("Gagal membuat PDF. Coba gunakan format lain atau hubungi admin.");
      }
    } else {
      let url = `/api/admin/export/${format}?periode=${periode}&start=${from}&end=${to}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-4 sm:p-5 shadow-sm">
      <h3 className="mb-3 text-[13px] sm:text-sm font-bold text-gray-800">
        Export Laporan Akhir
      </h3>


      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-semibold text-gray-600">Pilih Periode</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "harian", label: "Harian" },
              { id: "mingguan", label: "Mingguan" },
              { id: "bulanan", label: "Bulanan" },
            ].map((p) => (
              <label
                key={p.id}
                className={`flex-1 sm:flex-none flex justify-center items-center px-3 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${periode === p.id
                  ? "bg-[#1F3A93] text-white border-[#1F3A93] shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#1F3A93]"
                  }`}
              >
                <input
                  type="radio"
                  name="periode"
                  value={p.id}
                  checked={periode === p.id}
                  onChange={() => {
                    setPeriode(p.id);
                    setFrom("");
                    setTo("");
                    setDateError("");
                  }}
                  className="hidden"
                />
                {p.label}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] sm:text-[10px] text-gray-500 italic">
            {periode === "harian" && "* Pilih 1 hari yang sama"}
            {periode === "mingguan" && "* Otomatis rentang 7 hari dari tanggal mulai"}
            {periode === "bulanan" && "* Otomatis rentang 30 hari dari tanggal mulai"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-semibold text-gray-600">Dari</label>
            <input
              type="date"
              value={from}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px] sm:text-xs focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] h-[34px] sm:h-[38px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] sm:text-xs font-semibold text-gray-600">Sampai</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-[10px] sm:text-xs focus:border-[#1F3A93] focus:outline-none h-[34px] sm:h-[38px] text-gray-500"
              readOnly
            />
          </div>
        </div>
      </div>


      {dateError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {dateError}
        </div>
      )}


      <div className="mb-5">
        <label className="mb-1.5 block text-[11px] sm:text-xs font-semibold text-gray-600">
          Format File
        </label>

        <div className="flex flex-wrap gap-1.5">
          {["pdf", "csv", "excel"].map((item) => (
            <label
              key={item}
              className={`flex-1 sm:flex-none flex justify-center items-center px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${format === item
                ? "bg-[#1F3A93] text-white border-[#1F3A93] shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#1F3A93]"
                }`}
            >
              <input
                type="radio"
                name="format"
                value={item}
                checked={format === item}
                onChange={() => setFormat(item as any)}
                className="hidden"
              />
              <span className="text-[10px] sm:text-xs font-bold">{item.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>


      <button
        type="button"
        onClick={handleExport}
        disabled={!!dateError || !from || !to}
        className="w-full sm:w-auto rounded-lg bg-[#1F3A93] px-5 py-2 text-[11px] sm:text-xs font-bold text-white shadow-md transition-all hover:bg-[#162C6E] active:scale-95 disabled:opacity-50"
      >
        Export Laporan
      </button>
    </div>
  );
}
