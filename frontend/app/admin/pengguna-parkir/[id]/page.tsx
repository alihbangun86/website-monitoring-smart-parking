"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type Profil = {
  npm: string;
  nama: string;
  email: string;
  jurusan: string;
  prodi: string;
  status_akun: number;
  plat_nomor: string | null;
  stnk: string | null;
  foto: string | null;
  sisa_kuota?: number;
  id_kendaraan: number;
  kode_rfid?: string;
};

type RiwayatItem = {
  tanggal: string;
  masuk: string;
  keluar: string;
  status: string;
  plat_motor: string;
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const npm = resolvedParams.id;

  const [profil, setProfil] = useState<Profil | null>(null);
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKuota, setEditKuota] = useState<string>("");
  const [editRfid, setEditRfid] = useState<string>("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const limit = 5;

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/profile?npm=${npm}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok) {
        setProfil(json.data);
        if (json.data.kode_rfid) {
          setEditRfid(json.data.kode_rfid);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayat = async () => {
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`/api/admin/parkir?search=${npm}&limit=${limit}&offset=${offset}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.status === "success") {
        setRiwayat(json.data);
        setTotalData(json.total || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (npm) fetchDetail();
  }, [npm]);

  useEffect(() => {
    if (npm) fetchRiwayat();
  }, [npm, page]);

  const handleUpdateRfid = async () => {
    if (!editRfid.trim()) {
      alert("Masukkan Kode RFID");
      return;
    }

    try {
      const res = await fetch("/api/admin/rfid/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_kendaraan: profil?.id_kendaraan,
          kode_rfid: editRfid.trim()
        }),
      });

      if (res.ok) {
        alert("RFID berhasil diperbarui");
        fetchDetail();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal memperbarui RFID");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleUpdateKuota = async () => {
    if (!editKuota || isNaN(Number(editKuota))) {
      alert("Masukkan angka yang valid");
      return;
    }

    try {
      const res = await fetch("/api/admin/kuota", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, batas_parkir: Number(editKuota) }),
      });

      if (res.ok) {
        alert("Kuota berhasil diperbarui");
        setEditKuota("");
        fetchDetail();
      } else {
        alert("Gagal memperbarui kuota");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  const handleUpdateStatus = async (status: number) => {
    const confirm = window.confirm(
      status === 1 ? "Aktifkan akun ini?" : "Blokir akun ini?"
    );
    if (!confirm) return;

    try {
      const res = await fetch("/api/admin/pengguna/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, status_akun: status }),
      });
      if (res.ok) {
        alert("Status berhasil diperbarui");
        fetchDetail();
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  const handleHapus = async () => {
    if (!confirm(`Hapus pengguna ${profil?.nama}?`)) return;
    try {
      const res = await fetch(`/api/admin/pengguna/${npm}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Pengguna berhasil dihapus");
        router.push("/admin/pengguna-parkir");
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus pengguna");
      }
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Memuat detail...</div>;
  if (!profil) return <div className="p-8 text-center text-sm text-red-500">Data tidak ditemukan</div>;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="mx-auto w-full space-y-6">
      {/* SINGLE CARD CONTAINER */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">

        {/* TOP BAR: KEMBALI + ACTIONS */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1F3A93] transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="flex flex-wrap gap-3">
            {profil.status_akun !== 1 && (
              <button
                onClick={() => handleUpdateStatus(1)}
                className="rounded-md bg-green-600 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm"
              >
                Aktifkan Pengguna
              </button>
            )}

            {profil.status_akun === 1 && (
              <button
                onClick={() => handleUpdateStatus(2)}
                className="rounded-md bg-yellow-500 px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-yellow-600 transition shadow-sm"
              >
                Blokir Pengguna
              </button>
            )}

            <button
              onClick={handleHapus}
              className="rounded-md border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs md:text-sm font-semibold hover:bg-red-100 transition shadow-sm"
            >
              Hapus Pengguna
            </button>
          </div>
        </div>

        {/* ================= IDENTITAS ================= */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">

          {/* KOLOM FOTO & STATUS */}
          <div className="flex flex-col items-center gap-3">
            {/* Foto Profile */}
            <div className="h-32 w-32 md:h-32 md:w-32 overflow-hidden rounded-full border-2 border-[#1F3A93] bg-gray-100 flex-shrink-0 shadow-sm">
              {profil.foto ? (
                <img
                  src={`${apiBase}/uploads/${profil.foto}`}
                  alt="Foto Profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                  Tanpa Foto
                </div>
              )}
            </div>

            {/* Status Aktif */}
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-sm
                ${profil.status_akun === 1
                  ? "bg-green-100 text-green-700"
                  : profil.status_akun === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {profil.status_akun === 1 ? "Aktif" : profil.status_akun === 2 ? "Diblokir" : "Menunggu"}
            </span>
          </div>

          {/* TEXT DETAILS */}
          <div className="flex-1 space-y-2 text-center md:text-left pt-2 text-sm">
            <p className="text-xl font-bold text-gray-800">{profil.nama}</p>
            <p className="text-sm font-semibold text-[#1F3A93]">{profil.npm}</p>
            <p className="text-gray-600 font-medium">{profil.email}</p>
            <p className="text-xs text-gray-500">{profil.jurusan} • {profil.prodi}</p>
          </div>
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* ================= INFORMASI TEKNIS ================= */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Info label="Nomor Kendaraan" value={profil.plat_nomor || "-"} />

          <div className="space-y-2">
            <Info label="Kode RFID" value={profil.kode_rfid || "Belum Terdaftar"} />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Input RFID"
                value={editRfid}
                onChange={(e) => setEditRfid(e.target.value)}
                className="w-full sm:w-32 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-[#1F3A93]"
              />
              <button
                onClick={handleUpdateRfid}
                className="rounded bg-[#1F3A93] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#162C6E]"
              >
                SET
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Info label="Sisa Kesempatan Parkir" value={`${profil.sisa_kuota ?? 0} Kali`} />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Set Batas"
                value={editKuota}
                onChange={(e) => setEditKuota(e.target.value)}
                className="w-full sm:w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-[#1F3A93]"
              />
              <button
                onClick={handleUpdateKuota}
                className="rounded bg-[#1F3A93] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#162C6E]"
              >
                SET
              </button>
            </div>
            <p className="text-[9px] text-gray-400 italic font-medium">*Mengubah seluruh batas</p>
          </div>
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* ================= STNK ================= */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Lampiran STNK
          </h2>
          {profil.stnk ? (
            <div className="flex flex-col items-start gap-4">
              <div className="relative h-48 w-full sm:w-80 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-50">
                <img
                  src={`${apiBase}/uploads/${profil.stnk}`}
                  alt="STNK"
                  className="h-full w-full object-contain"
                />
              </div>
              <a
                href={`${apiBase}/uploads/${profil.stnk}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
              >
                Buka Gambar Penuh ↗
              </a>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Belum ada lampiran STNK</p>
          )}
        </div>

        <div className="my-8 h-px bg-gray-100" />

        {/* ================= RIWAYAT PER USER ================= */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Riwayat Parkir
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="px-4 py-2 border-r whitespace-nowrap">No</th>
                  <th className="px-4 py-2 border-r whitespace-nowrap">Tanggal</th>
                  <th className="px-4 py-2 border-r whitespace-nowrap">Nomor Kendaraan</th>
                  <th className="px-4 py-2 border-r whitespace-nowrap">Masuk</th>
                  <th className="px-4 py-2 border-r whitespace-nowrap">Keluar</th>
                  <th className="px-4 py-2 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riwayat.length > 0 ? (
                  riwayat.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border-r text-center">{idx + 1 + (page - 1) * limit}</td>
                      <td className="px-4 py-2 border-r whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-4 py-2 border-r whitespace-nowrap font-medium text-gray-800">{item.plat_motor}</td>
                      <td className="px-4 py-2 border-r whitespace-nowrap text-gray-700">{item.masuk}</td>
                      <td className="px-4 py-2 border-r whitespace-nowrap text-gray-700">{item.keluar}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                          ${item.status === "Terparkir" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400 italic bg-gray-50">
                      Belum ada riwayat parkir
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Menampilkan {riwayat.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
              {Math.min(page * limit, totalData)} dari {totalData} data
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded border px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Sebelumnya
              </button>
              <button
                disabled={page * limit >= totalData}
                onClick={() => setPage(p => p + 1)}
                className="rounded border px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= REUSABLE INFO ================= */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
