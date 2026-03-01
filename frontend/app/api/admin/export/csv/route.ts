import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";

    // Ambil data mentah dari endpoint backend
    const backendUri = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/parkir`);
    backendUri.searchParams.append("limit", "100000");
    if (start) backendUri.searchParams.append("start", start);
    if (end) backendUri.searchParams.append("end", end);

    const res = await fetch(backendUri.toString(), { cache: "no-store" });

    if (!res.ok) {
        return new NextResponse("Gagal mengambil data dari server", { status: res.status });
    }

    const { data: dataParkir } = await res.json();

    // Buat konten CSV
    const headers = ["No", "NPM", "Nama", "Nomor Kendaraan", "Tanggal", "Hari", "Masuk", "Keluar", "Status"];
    const rows = (dataParkir || []).map((item: any, index: number) => [
        index + 1,
        item.npm || "-",
        item.nama,
        item.plat_motor,
        item.tanggal,
        item.hari,
        item.masuk,
        item.keluar,
        item.status
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=laporan-parkir-${start || 'semua'}.csv`
        }
    });
}
