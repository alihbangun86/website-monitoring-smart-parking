import { NextResponse } from "next/server";

/**
 * GET /api/statistik/kendaraan?periode=harian|mingguan|bulanan
 * MOCK API - FORMAT DISAMAKAN DENGAN BACKEND EXPRESS
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode");

    // 1️⃣ Validasi parameter (SAMA dengan BE)
    if (!periode || !["harian", "mingguan", "bulanan"].includes(periode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Periode tidak valid",
        },
        { status: 400 },
      );
    }

    // 2️⃣ Mock data (STRUKTUR SAMA DENGAN BE)
    let labels: string[] = [];
    let data: number[] = [];

    if (periode === "harian") {
      labels = [
        "06.00",
        "07.00",
        "08.00",
        "09.00",
        "10.00",
        "11.00",
        "12.00",
        "13.00",
        "14.00",
        "15.00",
        "16.00",
        "17.00",
      ];
      data = [12, 25, 40, 55, 48, 50, 45, 38, 42, 36, 28, 20];
    }

    if (periode === "mingguan") {
      labels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
      data = [720, 680, 750, 800, 770];
    }

    if (periode === "bulanan") {
      labels = ["Jan", "Feb", "Mar", "Apr", "Mei"];
      data = [2800, 3000, 3200, 3500, 3700];
    }

    // 3️⃣ Response (IDENTIK dengan BE)
    return NextResponse.json({
      success: true,
      labels,
      data,
    });
  } catch (error) {
    console.error("Statistik API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil statistik kendaraan",
      },
      { status: 500 },
    );
  }
}
