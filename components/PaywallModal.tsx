"use client";
import { useState } from "react";

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL ?? "#";

interface Props {
  email?: string;
  scansRemaining?: number;
  onClose: () => void;
  onAccessGranted: () => void;
}

export default function PaywallModal({ email, scansRemaining = 0, onClose, onAccessGranted }: Props) {
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState("");
  const checkoutUrl = email ? `${KOFI_URL}?email=${encodeURIComponent(email)}` : KOFI_URL;

  async function handleCheckAccess() {
    if (!email) return;
    setChecking(true);
    setCheckMsg("");
    const res = await fetch(`/api/check-access?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setChecking(false);
    if (data.canScan) {
      setCheckMsg("✅ Top-up berhasil! Scan kamu sudah ditambahkan...");
      setTimeout(() => onAccessGranted(), 1200);
    } else {
      setCheckMsg("❌ Pembayaran belum terdeteksi. Pastikan pakai email yang sama.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-3">⚡</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {scansRemaining === 0 ? "Scan Habis!" : "Kuota Gratis Habis"}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Top-up <strong>10 scan</strong> lagi dengan sekali bayar. Bisa top-up berkali-kali!
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-2">
          <p className="text-3xl font-bold text-orange-500">$1.50</p>
          <p className="text-gray-400 text-sm">= 10 scan · Tidak expired · Top-up kapan saja</p>
        </div>

        {email && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            ⚠️ Bayar dengan email: <strong>{email}</strong>
          </p>
        )}

        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
          ☕ Top-up via Ko-fi (+10 scan)
        </a>

        <button onClick={handleCheckAccess} disabled={checking}
          className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-2.5 rounded-xl transition-colors mb-3 text-sm">
          {checking ? "Mengecek..." : "✅ Saya sudah bayar, cek akses"}
        </button>

        {checkMsg && (
          <p className={`text-sm mb-3 ${checkMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
            {checkMsg}
          </p>
        )}

        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600">
          Nanti saja
        </button>
      </div>
    </div>
  );
}
