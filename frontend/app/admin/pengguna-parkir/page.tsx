"use client";

import { useState } from "react";
import DataPenggunaTable from "@/app/components/DataPenggunaTable";

export default function PenggunaParkirAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="rounded-xl bg-white p-3 md:p-5 shadow-sm">
        <h3 className="mb-3 md:mb-4 text-xs md:text-sm font-semibold text-gray-800">
          Pencarian & Filter Pengguna
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          <input
            type="text"
            placeholder="Cari Nama / NPM / Nomor Kendaraan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-xs transition
              focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-xs transition
              focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93]"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="menunggu">Menunggu Validasi</option>
            <option value="diblokir">Diblokir</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </section>


      <DataPenggunaTable search={search} statusFilter={statusFilter} />

      <div className="h-10" />
    </div>
  );
}
