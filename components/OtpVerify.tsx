"use client";
import { useState, useRef } from "react";
import { supabaseClient } from "@/lib/supabase-client";

interface Props {
  email: string;
  onVerified: (token: string) => void;
  onBack: () => void;
}

export default function OtpVerify({ email, onVerified, onBack }: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^[0-9a-zA-Z]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleVerify() {
    const token = otp.join("").trim();
    if (token.length < 6) return;

    setLoading(true);
    setError("");

    const { data, error: err } = await supabaseClient.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (err || !data.session) {
      setError("Kode salah atau sudah kedaluwarsa. Coba lagi.");
      setLoading(false);
      return;
    }

    onVerified(data.session.access_token);
  }

  async function handleResend() {
    setResending(true);
    await supabaseClient.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setResending(false);
    setError("Kode baru sudah dikirim!");
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-2">📧</div>
        <h2 className="font-bold text-gray-800 text-lg">Cek emailmu</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kode 6 digit dikirim ke <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((val, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors"
          />
        ))}
      </div>

      {error && (
        <p className={`text-sm text-center ${error.includes("dikirim") ? "text-green-600" : "text-red-500"}`}>
          {error}
        </p>
      )}

      <button
        onClick={handleVerify}
        disabled={otp.join("").length < 6 || loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? "Memverifikasi..." : "✅ Verifikasi"}
      </button>

      <div className="flex justify-between text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-gray-600">← Ganti email</button>
        <button onClick={handleResend} disabled={resending} className="hover:text-gray-600">
          {resending ? "Mengirim..." : "Kirim ulang kode"}
        </button>
      </div>
    </div>
  );
}
