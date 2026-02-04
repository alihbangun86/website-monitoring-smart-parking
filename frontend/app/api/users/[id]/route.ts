import { NextResponse } from "next/server";

/**
 * GET /api/users/:id
 * Ambil detail pengguna (mock)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    data: {
      id: id,
      nama: "Mahasiswa A",
      npm: id,
      email: "mahasiswa@email.com",
      rfid: "RFID001",
      parking_attempt: 10,
      status: "active",
    },
  });
}

/**
 * PUT /api/users/:id
 * Update data pengguna (mock)
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { nama, email, parking_attempt, status } = body;

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      data: {
        id: id,
        nama: nama ?? "Mahasiswa A",
        email: email ?? "mahasiswa@email.com",
        parking_attempt: parking_attempt ?? 10,
        status: status ?? "active",
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/:id
 * Hapus pengguna (mock)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    message: "Pengguna berhasil dihapus",
    userId: id,
  });
}
