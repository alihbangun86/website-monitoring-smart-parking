import { NextResponse } from "next/server";

const BE_URL = "http://localhost:5000/api/admin/pengguna";

export async function GET() {
    try {
        const res = await fetch(BE_URL, {
            cache: "no-store",
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("FE API GET pengguna error:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal mengambil data pengguna" },
            { status: 500 }
        );
    }
}
