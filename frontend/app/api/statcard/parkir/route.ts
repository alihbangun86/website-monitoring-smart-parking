import { NextResponse } from "next/server";

/**
 * GET /api/statcard/parkir
 * Proxy ke Backend Express -> /api/statistik/parkir
 */
export async function GET() {
  try {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    // 🔗 SESUAI DENGAN index.js BACKEND
    const res = await fetch(`http://localhost:5000/api/statistik/parkir`, {
      method: "GET",
      cache: "no-store", // data real-time
    });

    // ❌ Backend error
    if (!res.ok) {
      let message = "Backend error";
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch {}

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: res.status },
      );
    }

    // ✅ Sukses
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ StatCard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data statcard",
      },
      { status: 500 },
    );
  }
}
