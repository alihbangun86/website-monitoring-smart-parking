import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";

    const backendUri = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/parkir`);
    backendUri.searchParams.append("limit", "100000");
    if (start) backendUri.searchParams.append("start", start);
    if (end) backendUri.searchParams.append("end", end);

    const res = await fetch(backendUri.toString(), { cache: "no-store" });
    if (!res.ok) return new NextResponse("Gagal mengambil data", { status: res.status });

    const { data: dataParkir } = await res.json();

    let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"></head>
        <body>
        <table border="1">
            <tr style="background-color: #1F3A93; color: white; font-weight: bold;">
                <th>No</th><th>NPM</th><th>Nama</th><th>Nomor Kendaraan</th><th>Tanggal</th><th>Hari</th><th>Masuk</th><th>Keluar</th><th>Status</th>
            </tr>
            ${(dataParkir || []).map((item: any, index: number) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.npm || "-"}</td>
                    <td>${item.nama}</td>
                    <td>${item.plat_motor}</td>
                    <td>${item.tanggal}</td>
                    <td>${item.hari}</td>
                    <td>${item.masuk}</td>
                    <td>${item.keluar}</td>
                    <td>${item.status}</td>
                </tr>
            `).join("")}
        </table>
        </body></html>
    `;

    return new NextResponse(html, {
        headers: {
            "Content-Type": "application/vnd.ms-excel",
            "Content-Disposition": `attachment; filename=laporan-parkir-${start || 'semua'}.xls`
        }
    });
}
