import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/parkir/export/pdf`);
    url.search = searchParams.toString();

    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
        return new NextResponse(await res.text(), {
            status: res.status,
            headers: { "Content-Type": "text/plain" }
        });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    const contentDisp = res.headers.get("Content-Disposition");
    if (contentDisp) headers.set("Content-Disposition", contentDisp);

    return new NextResponse(blob, { headers });
}
