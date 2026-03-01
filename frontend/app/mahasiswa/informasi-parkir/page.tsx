"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import StatCard from "@/app/components/StatCard";
import { io } from "socket.io-client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type RiwayatMasuk = {
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  status: "Masuk" | "Keluar";
};

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
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRef = useRef<any>(null);
  const riwayatRef = useRef<any>(null);

  const fetchStatCard = useCallback(async (signal?: AbortSignal) => {
    try {
      const npm = localStorage.getItem("npm");
      let url = `/api/statcard/parkir`;
      if (npm) url += `?npm=${npm}`;

      const res = await fetch(url, {
        cache: "no-store",
        signal
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatcard(result.data);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Gagal mengambil statcard:", error);
      }
    }
  }, []);

  const fetchRiwayatParkir = useCallback(async (signal?: AbortSignal) => {
    try {
      const npm = localStorage.getItem("npm");

      if (!npm) {
        setRiwayat([]);
        return;
      }

      const res = await fetch(
        `/api/users/riwayat/${npm}`,
        { cache: "no-store", signal },
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
        setTotal(mapped.length);
      } else {
        setRiwayat([]);
        setTotal(0);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Gagal mengambil riwayat parkir:", error);
        setRiwayat([]);
        setTotal(0);
      }
    } finally {
      setLoadingRiwayat(false);
    }
  }, []);

  useEffect(() => {
    fetchRef.current = fetchStatCard;
    riwayatRef.current = fetchRiwayatParkir;
  }, [fetchStatCard, fetchRiwayatParkir]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStatCard(controller.signal);
    fetchRiwayatParkir(controller.signal);
    return () => controller.abort();
  }, [fetchStatCard, fetchRiwayatParkir]);

  useEffect(() => {
    console.log("Initializing socket for Informasi Parkir...");
    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : `http://${window.location.hostname}:5000`;

    const socket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Informasi Parkir Socket Connected to:", socketHost);
      console.log("Socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Informasi Parkir Socket Disconnected:", reason);
    });

    socket.on("parking_update", (payload: any) => {
      console.log("Informasi Parkir real-time update:", payload);
      console.log("Refreshing statcard and riwayat...");
      if (fetchRef.current) fetchRef.current();
      if (riwayatRef.current) riwayatRef.current();
    });

    socket.on("user_update", (payload: any) => {
      console.log("User update received:", payload);
      if (fetchRef.current) fetchRef.current();
    });

    socket.on("connect_error", (err) => {
      console.error("Informasi Parkir Socket Error:", err.message);
    });

    return () => {
      console.log("Disconnecting Informasi Parkir socket...");
      socket.disconnect();
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStatCard(), fetchRiwayatParkir()]);
    setLoading(false);
  };

  const totalPages = Math.ceil(total / limit);
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const statusParkir = statcard.tersedia === 0 ? "Penuh" : "Tersedia";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-gray-700">Status Parkir:</span>
        <span
          className={`rounded px-3 py-1 text-xs font-semibold text-white ${statusParkir === "Penuh" ? "bg-red-600" : "bg-green-600"
            }`}
        >
          {statusParkir}
        </span>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Ketersediaan Parkir
          </h3>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Terisi" value={statcard.terisi} unit="Kendaraan" />
          <StatCard title="Tersedia" value={statcard.tersedia} unit="Slot" />
          <StatCard
            title="Kesempatan Parkir"
            value={statcard.kesempatan_parkir}
            unit="Kali"
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-2 md:p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-800">
            Riwayat Parkir Anda
          </h3>

          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <span className="text-gray-500">Tampilkan</span>
            <div className="relative w-fit">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="appearance-none rounded border border-gray-300 px-2 py-1 pr-8 bg-white focus:border-[#1F3A93] focus:outline-none text-[10px] md:text-xs"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <span className="text-gray-500">data per halaman</span>
          </div>
        </div>

        {loadingRiwayat ? (
          <p className="text-xs text-gray-500 px-1">Memuat riwayat...</p>
        ) : riwayat.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <Th>No</Th>
                    <Th>Tanggal</Th>
                    <Th>Waktu Masuk</Th>
                    <Th>Waktu Keluar</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.slice((page - 1) * limit, page * limit).map((item, index) => (
                    <tr
                      key={index}
                      className="border-t text-center hover:bg-[#F4F6F8] transition-colors"
                    >
                      <Td className="text-gray-500 text-[11px]">
                        {(page - 1) * limit + index + 1}
                      </Td>
                      <Td className="font-medium text-gray-700">{item.tanggal}</Td>
                      <Td>{item.waktuMasuk}</Td>
                      <Td>{item.waktuKeluar ?? "-"}</Td>
                      <Td>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold whitespace-nowrap ${item.status === "Masuk"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 text-xs text-gray-600 border-t pt-4">
              <div>
                Menampilkan <span className="font-semibold">{(page - 1) * limit + 1}</span> -{" "}
                <span className="font-semibold">{Math.min(page * limit, total)}</span> dari{" "}
                <span className="font-semibold">{total}</span> data
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                  title="Awal"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                  title="Kembali"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="hidden sm:flex items-center gap-1 mx-1">
                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-7 h-7 rounded flex items-center justify-center font-medium transition ${page === num
                        ? "bg-[#1F3A93] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <span className="sm:hidden mx-2 font-medium">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                  title="Lanjut"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                  title="Akhir"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500 px-1">Belum ada riwayat parkir</p>
        )}
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-xs font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 text-xs text-gray-600 ${className}`}>
      {children}
    </td>
  );
}
