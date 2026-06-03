"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import UploadZone from "@/components/UploadZone";
import OtpVerify from "@/components/OtpVerify";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaywallModal from "@/components/PaywallModal";
import type { UserAccess } from "@/types";

type Step = "email" | "otp" | "scan";

const CUISINE_OPTIONS = ["Semua", "Indonesia", "Western", "Chinese", "Japanese", "Korean"];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cuisine, setCuisine] = useState("Semua");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSendingOtp(true);
    setError("");
    const { error: err } = await supabaseClient.auth.signInWithOtp({
      email, options: { shouldCreateUser: true },
    });
    setSendingOtp(false);
    if (err) { setError("Gagal mengirim kode. Coba lagi."); return; }
    setStep("otp");
  }

  async function handleVerified(accessToken: string) {
    setToken(accessToken);
    const res = await fetch(`/api/check-access?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setAccess(data);
    setStep("scan");
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !token) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", email);
    formData.append("token", token);
    formData.append("cuisine", cuisine);

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.status === 403 && data.error === "QUOTA_EXCEEDED") { setShowPaywall(true); return; }
    if (res.status === 429) { setError("Terlalu banyak scan dari jaringan ini."); return; }
    if (res.status === 401) { setError("Sesi habis. Verifikasi email lagi."); setStep("email"); return; }
    if (!res.ok) { setError("Gagal menganalisis foto. Coba lagi."); return; }

    setAccess(data.access);
    sessionStorage.setItem("recipe-result", JSON.stringify({ ...data, email, token }));
    router.push("/result");
  }

  function handleAccessGranted() {
    setShowPaywall(false);
    fetch(`/api/check-access?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(setAccess);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {showPaywall && (
        <PaywallModal
          email={email}
          scansRemaining={access?.scansRemaining ?? 0}
          onClose={() => setShowPaywall(false)}
          onAccessGranted={handleAccessGranted}
        />
      )}

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🍳 Mau Masak Apa?</h1>
          <p className="text-gray-500 mt-2">Foto isi kulkasmu → dapat 3 resep instan dari AI</p>
          <span className="inline-block mt-2 bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1 rounded-full">
            ✨ 2 scan gratis!
          </span>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email kamu</label>
              <input type="email" placeholder="contoh@gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={!email || sendingOtp}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {sendingOtp ? "Mengirim kode..." : "📧 Kirim Kode OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <OtpVerify email={email} onVerified={handleVerified} onBack={() => setStep("email")} />
        )}

        {step === "scan" && (
          <form onSubmit={handleScan} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                <span>✅</span>
                <span className="font-medium">{email}</span>
              </div>
              {access && (
                <span className="text-xs text-gray-400">
                  {access.isPaid
                    ? `⚡ ${access.scansRemaining} scan tersisa`
                    : `🆓 ${access.scansRemaining} scan gratis tersisa`}
                </span>
              )}
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter masakan</label>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((c) => (
                  <button key={c} type="button" onClick={() => setCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      cuisine === c
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <UploadZone onFileSelect={setFile} disabled={loading} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={!file || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? "Menganalisis..." : "🔍 Cari Resep Sekarang"}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner text="AI sedang menganalisis isi kulkasmu..." />}
        <p className="text-center text-gray-400 text-xs mt-6">
          GPT-4o · Email terverifikasi · Tanpa iklan
        </p>
      </div>
    </main>
  );
}
