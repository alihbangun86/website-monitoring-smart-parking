import StatistikKendaraan from "@/app/components/statistik-kendaraan";
import LaporanExport from "@/app/components/LaporanExport";

export default function StatistikPenggunaAdminPage() {
  return (
    <div className="space-y-6">
      {/* ================= STATISTIK KENDARAAN ================= */}
      <section >


        <StatistikKendaraan />
      </section>

      {/* ================= EXPORT LAPORAN ================= */}
      <section>

        <LaporanExport />
      </section>
    </div>
  );
}
