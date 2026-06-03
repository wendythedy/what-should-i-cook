"use client";

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL ?? "#";

export default function PaywallModal({ onClose, email }: { onClose: () => void; email?: string }) {
  // Pre-fill Ko-fi with the user's email via query param
  const checkoutUrl = email ? `${KOFI_URL}?email=${encodeURIComponent(email)}` : KOFI_URL;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Kuota Gratis Habis</h2>
        <p className="text-gray-500 text-sm mb-6">
          Kamu sudah pakai 2 scan gratis. Unlock unlimited scan selamanya hanya dengan sekali bayar!
        </p>
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <p className="text-3xl font-bold text-orange-500">$1.50</p>
          <p className="text-gray-400 text-sm">Bayar sekali, pakai selamanya</p>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
          ⚠️ Pastikan kamu bayar dengan email yang sama: <strong>{email}</strong>
        </p>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
        >
          ☕ Bayar via Ko-fi
        </a>
        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600">
          Nanti saja
        </button>
      </div>
    </div>
  );
}
