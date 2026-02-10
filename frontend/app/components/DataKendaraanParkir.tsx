"use client";

import { useEffect, useState } from "react";

type Kendaraan = {
  no?: number;
  npm: string;
  nama: string;
  plat_motor: string;
  tanggal: string;
  hari: string;
  masuk: string;
  keluar: string;
  status: "Terparkir" | "Keluar";
};

type Props = {
  search?: string;
  startDate?: string;
  endDate?: string;
};

export default function DataKendaraanParkir({
  search = "",
  startDate = "",
  endDate = "",
}: Props = {}) {
  const [data, setData] = useState<Kendaraan[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          limit: String(limit),
          offset: "0",
        });

        if (search) params.append("search", search);
        if (startDate) params.append("start", startDate);
        if (endDate) params.append("end", endDate);

        const res = await fetch(
          `/api/admin/parkir?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error("HTTP error");
        }

        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setData([]);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("FETCH DATA PARKIR ERROR:", err);
          setError("Gagal memuat data parkir");
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [limit, search, startDate, endDate]);

  return (
    <section className="rounded-xl bg-[#E9EBEE] p-6 shadow-sm">
      {/* ===== HEADER ===== */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Data Kendaraan Parkir
        </h2>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Tampilkan</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1
              focus:border-[#1F3A93] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-gray-600">data</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto rounded-lg bg-white">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <Th>No</Th>
              <Th>NPM</Th>
              <Th>Nama</Th>
              <Th>Plat Motor</Th>
              <Th>Tanggal</Th>
              <Th>Hari</Th>
              <Th>Masuk</Th>
              <Th>Keluar</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && !error && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}

            {!loading &&
              data.map((item, index) => (
                <tr
                  key={`${item.npm}-${item.tanggal}-${item.masuk}-${index}`}
                  className="border-t text-center transition hover:bg-[#F4F6F8]"
                >
                  <Td>{item.no ?? index + 1}</Td>
                  <Td className="font-medium text-gray-600">{item.npm}</Td>
                  <Td className="font-semibold text-[#1F3A93]">{item.nama}</Td>
                  <Td>{item.plat_motor}</Td>
                  <Td>{item.tanggal}</Td>
                  <Td>{item.hari}</Td>
                  <Td>{item.masuk}</Td>
                  <Td>{item.keluar}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.status === "Terparkir"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {item.status}
                    </span>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ===== INFO / ERROR ===== */}
      {!loading && !error && (
        <div className="mt-3 text-xs text-gray-600">
          Menampilkan {data.length} data
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-red-500">{error}</div>
      )}
    </section>
  );
}

/* ===== REUSABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-gray-700">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
