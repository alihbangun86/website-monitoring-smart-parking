import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Monitoring Parkir Jurusan Teknik Geodesi",
  description: "Sistem Monitoring Parkir Jurusan Teknik Geodesi Universitas Lampung",
  icons: {
    icon: "/logo-unila.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
