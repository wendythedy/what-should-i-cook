"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaywallModal from "@/components/PaywallModal";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !email) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", email);

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.status === 403 && data.error === "QUOTA_EXCEEDED") {
      setShowPaywall(true);
      return;
    }

    if (!res.ok) {
      setError("Gagal menganalisis foto. Coba lagi.");
      return;
    }

    sessionStorage.setItem("recipe-result", JSON.stringify(data));
    router.push("/result");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🍳 Mau Masak Apa?</h1>
          <p className="text-gray-500 mt-2">Foto isi kulkasmu → dapat 3 resep instan dari AI</p>
          <span className="inline-block mt-2 bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1 rounded-full">
            ✨ 2 scan gratis!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <UploadZone onFileSelect={setFile} disabled={loading} />

          <input
            type="email"
            placeholder="Email kamu (untuk simpan akses)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!file || !email || loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Menganalisis..." : "🔍 Cari Resep Sekarang"}
          </button>
        </form>

        {loading && (
          <LoadingSpinner text="AI sedang menganalisis isi kulkasmu... (5-10 detik)" />
        )}

        <p className="text-center text-gray-400 text-xs mt-6">
          Ditenagai GPT-4o · Privasi terjaga · Tanpa iklan
        </p>
      </div>
    </main>
  );
}
