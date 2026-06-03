"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HistoryItem } from "@/types";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("recipe-result");
    if (!stored) { router.push("/"); return; }
    const { email, token } = JSON.parse(stored);
    if (!email || !token) { router.push("/"); return; }

    fetch(`/api/history?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "PAID_ONLY") {
          setError("Fitur history hanya untuk pengguna berbayar.");
        } else {
          setHistory(data.history ?? []);
        }
        setLoading(false);
      });
  }, [router]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto pb-16">
      <div className="flex items-center gap-3 my-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Kembali
        </button>
        <h1 className="text-xl font-bold text-gray-800">📚 History Resep</h1>
      </div>

      {error ? (
        <div className="bg-orange-50 rounded-xl p-6 text-center">
          <p className="text-orange-600 font-medium">🔒 {error}</p>
          <button onClick={() => router.push("/")}
            className="mt-3 text-sm text-orange-500 hover:underline">
            Upgrade sekarang →
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-3">📭</p>
          <p>Belum ada history scan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex gap-3 p-4">
                {item.image_url && (
                  <img src={item.image_url} alt="scan" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {item.cuisine_filter}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {item.recipes.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-sm text-gray-700 truncate">🍽️ {r.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
