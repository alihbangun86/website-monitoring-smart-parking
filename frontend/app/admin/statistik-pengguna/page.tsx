import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import LaporanExport from "@/app/components/LaporanExport";

export default function StatistikPenggunaAdminPage() {
  return (
    <div className="space-y-6">
      {/* ================= STATISTIK KENDARAAN ================= */}
      <section className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-6">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Statistik Kendaraan
          </h2>
        </header>

        <StatistikKendaraan />
      </section>

      {/* ================= EXPORT LAPORAN ================= */}
      <section className="rounded-xl border border-gray-300 bg-[#E9EBEE] p-6">
        <header className="mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Export Laporan
          </h2>
        </header>

        <LaporanExport />
      </section>
    </div>
  );
}
