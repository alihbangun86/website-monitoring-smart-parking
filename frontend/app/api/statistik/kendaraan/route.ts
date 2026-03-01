import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode");


    if (!periode || !["harian", "mingguan", "bulanan"].includes(periode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Periode tidak valid",
        },
        { status: 400 },
      );
    }



    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/statistik/kendaraan`);
    url.search = searchParams.toString();

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();


    return NextResponse.json(data, {
      status: res.status,
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
