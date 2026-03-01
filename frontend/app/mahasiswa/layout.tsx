import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
