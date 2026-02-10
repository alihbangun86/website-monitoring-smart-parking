"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const npm = resolvedParams.id;

  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [editKuota, setEditKuota] = useState<string>("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/profile?npm=${npm}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok) {
        setProfil(json.data);
        // Hint: sisa_kuota dihitung dari batas - terpakai di backend.
        // Kita butuh batas_parkir-nya untuk diedit. 
        // Namun sisa_kuota cukup sebagai indikator. 
        // Admin akan memasukkan TOTAL BATAS PARKIR baru.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [npm]);

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
      }
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Memuat detail...</div>;
  if (!profil) return <div className="p-8 text-center text-sm text-red-500">Data tidak ditemukan</div>;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* ================= HEADER ================= */}
      <div className="rounded-xl border border-[#1F3A93] bg-white p-6">
        <h1 className="text-lg font-semibold text-[#1F3A93]">
          Detail Pengguna Parkir
        </h1>
        <p className="text-xs text-gray-500">
          NPM: {profil.npm}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-sm md:flex-row">
        {/* FOTO */}
        <div className="h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full border-2 border-[#1F3A93] bg-gray-100 flex-shrink-0">
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

        {/* IDENTITAS */}
        <div className="flex-1 space-y-2 text-sm text-center md:text-left">
          <p className="text-xl font-bold text-gray-800">{profil.nama}</p>
          <p className="text-gray-600 font-medium">{profil.email}</p>
          <p className="text-xs text-gray-500">{profil.jurusan} • {profil.prodi}</p>

          <div className="pt-2">
            <span
              className={`rounded-full px-4 py-1 text-xs font-bold
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
        </div>
      </div>

      {/* ================= INFORMASI TEKNIS ================= */}
      <div className="grid grid-cols-1 gap-6 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-3">
        <Info label="Nomor Kendaraan" value={profil.plat_nomor || "-"} />
        <Info label="Fakultas / Jurusan" value={profil.jurusan} />

        <div className="space-y-2">
          <Info label="Sisa Kesempatan Parkir" value={`${profil.sisa_kuota ?? 0} Kali`} />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              placeholder="Set Batas Baru"
              value={editKuota}
              onChange={(e) => setEditKuota(e.target.value)}
              className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-[#1F3A93]"
            />
            <button
              onClick={handleUpdateKuota}
              className="rounded bg-[#1F3A93] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#162C6E]"
            >
              SET
            </button>
          </div>
          <p className="text-[9px] text-gray-400 italic font-medium">*Mengubah seluruh batas (bukan sisa)</p>
        </div>
      </div>

      {/* ================= STNK ================= */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-800 border-b pb-2">
          Lampiran STNK
        </h2>
        {profil.stnk ? (
          <div className="mt-4 flex flex-col items-start gap-4">
            <div className="relative h-40 w-64 overflow-hidden rounded-lg border border-gray-200 shadow-sm transition hover:shadow-md">
              <img
                src={`${apiBase}/uploads/${profil.stnk}`}
                alt="STNK"
                className="h-full w-full object-contain bg-gray-50"
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

      {/* ================= ACTION ================= */}
      <div className="flex flex-wrap justify-between gap-3 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {profil.status_akun !== 1 && (
            <button
              onClick={() => handleUpdateStatus(1)}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Aktifkan Pengguna
            </button>
          )}

          {profil.status_akun === 1 && (
            <button
              onClick={() => handleUpdateStatus(2)}
              className="rounded-md bg-yellow-500 px-5 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
            >
              Blokir Pengguna
            </button>
          )}

          <button
            onClick={handleHapus}
            className="rounded-md border border-red-600 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Hapus Data
          </button>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm hover:bg-gray-100"
        >
          Kembali
        </button>
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

