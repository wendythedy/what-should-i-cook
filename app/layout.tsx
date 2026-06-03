import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mau Masak Apa? 🍳",
  description: "Foto isi kulkasmu, dapat 3 rekomendasi resep instan!",
  openGraph: {
    title: "Mau Masak Apa?",
    description: "Foto kulkas kamu → AI rekomendasikan resep terbaik",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-orange-50 min-h-screen`}>{children}</body>
    </html>
  );
}
