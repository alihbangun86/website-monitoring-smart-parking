import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 🔹 ambil npm dari header (sesuai user login)
    const npm = req.headers.get("x-npm");

    if (!npm) {
      return NextResponse.json(
        { status: "error", message: "NPM tidak ditemukan" },
        { status: 401 },
      );
    }

    // 🔹 panggil backend Express (controller JS)
    const res = await fetch(
      `${process.env.BACKEND_URL}/pengguna/riwayat/${npm}`,
      {
        cache: "no-store",
      },
    );

    const result = await res.json();

    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("API riwayat parkir error:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil riwayat parkir" },
      { status: 500 },
    );
  }
}
