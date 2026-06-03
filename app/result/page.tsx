"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeList from "@/components/RecipeList";
import GroceryList from "@/components/GroceryList";
import type { AnalyzeResult, UserAccess } from "@/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showGrocery, setShowGrocery] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("recipe-result");
    if (!stored) { router.push("/"); return; }
    const data = JSON.parse(stored);
    setResult(data);
    setAccess(data.access ?? null);
    setEmail(data.email ?? "");
    setToken(data.token ?? "");
  }, [router]);

  async function handleSaveHistory() {
    if (!email || !token || !result) return;
    const stored = sessionStorage.getItem("recipe-result");
    if (!stored) return;
    const data = JSON.parse(stored);

    await fetch("/api/analyze/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, token,
        image_url: data.imageUrl,
        ingredients: result.ingredients,
        recipes: result.recipes,
        cuisine_filter: data.cuisine ?? "Semua",
      }),
    });
    setSaved(true);
  }

  if (!result) return null;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto pb-16">
      {showGrocery && (
        <GroceryList recipes={result.recipes} onClose={() => setShowGrocery(false)} />
      )}

      <div className="flex items-center gap-3 my-6">
        <button onClick={() => router.push("/")}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
          ← Scan lagi
        </button>
        <h1 className="text-xl font-bold text-gray-800">Hasil Analisis</h1>
        {access?.isPaid && (
          <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
            ⚡ {access.scansRemaining} scan tersisa
          </span>
        )}
      </div>

      <RecipeList result={result} />

      {/* Action buttons */}
      <div className="mt-6 space-y-3">
        <button onClick={() => setShowGrocery(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
          🛒 Buat Grocery List
        </button>

        {access?.isPaid && (
          <button onClick={handleSaveHistory} disabled={saved}
            className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
            {saved ? "✅ Tersimpan di history" : "💾 Simpan ke History"}
          </button>
        )}

        {!access?.isPaid && (
          <p className="text-xs text-center text-gray-400">
            💡 Upgrade ke paid untuk simpan history resep
          </p>
        )}

        <button onClick={() => router.push("/")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
          📸 Scan Foto Lain
        </button>
      </div>
    </main>
  );
}
