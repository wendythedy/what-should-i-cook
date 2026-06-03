"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import UploadZone from "@/components/UploadZone";
import OtpVerify from "@/components/OtpVerify";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaywallModal from "@/components/PaywallModal";

type Step = "email" | "otp" | "scan";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState("");

  // Step 1: kirim OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSendingOtp(true);
    setError("");

    const { error: err } = await supabaseClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setSendingOtp(false);
    if (err) {
      setError("Gagal mengirim kode. Coba lagi.");
      return;
    }
    setStep("otp");
  }

  // Step 2: OTP verified
  function handleVerified(accessToken: string) {
    setToken(accessToken);
    setStep("scan");
  }

  // Step 3: scan foto
  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !token) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", email);
    formData.append("token", token);

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.status === 403 && data.error === "QUOTA_EXCEEDED") {
      setShowPaywall(true);
      return;
    }

    if (res.status === 429) {
      setError("Terlalu banyak scan dari jaringan ini. Coba lagi nanti.");
      return;
    }

    if (res.status === 401) {
      setError("Sesi habis. Silakan verifikasi email lagi.");
      setStep("email");
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
      {showPaywall && <PaywallModal email={email} onClose={() => setShowPaywall(false)} />}

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🍳 Mau Masak Apa?</h1>
          <p className="text-gray-500 mt-2">Foto isi kulkasmu → dapat 3 resep instan dari AI</p>
          <span className="inline-block mt-2 bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1 rounded-full">
            ✨ 2 scan gratis!
          </span>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email kamu</label>
              <input
                type="email"
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!email || sendingOtp}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {sendingOtp ? "Mengirim kode..." : "📧 Kirim Kode OTP"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Kode verifikasi akan dikirim ke emailmu
            </p>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <OtpVerify
            email={email}
            onVerified={handleVerified}
            onBack={() => setStep("email")}
          />
        )}

        {/* Step 3: Scan */}
        {step === "scan" && (
          <form onSubmit={handleScan} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">
              <span>✅</span>
              <span>Email terverifikasi: <strong>{email}</strong></span>
            </div>
            <UploadZone onFileSelect={setFile} disabled={loading} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Menganalisis..." : "🔍 Cari Resep Sekarang"}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner text="AI sedang menganalisis isi kulkasmu... (5-10 detik)" />}

        <p className="text-center text-gray-400 text-xs mt-6">
          Ditenagai GPT-4o · Email diverifikasi · Tanpa iklan
        </p>
      </div>
    </main>
  );
}
