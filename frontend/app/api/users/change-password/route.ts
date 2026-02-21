import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.npm || !body.password_baru) {
            return NextResponse.json(
                { success: false, message: "Data tidak lengkap" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/api/pengguna/users/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("CHANGE PASSWORD PROXY ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengubah kata sandi" },
            { status: 500 }
        );
    }
}
