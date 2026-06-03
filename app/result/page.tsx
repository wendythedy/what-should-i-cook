"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeList from "@/components/RecipeList";
import type { AnalyzeResult } from "@/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("recipe-result");
    if (!stored) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) return null;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto pb-16">
      <div className="flex items-center gap-3 my-6">
        <button
          onClick={() => router.push("/")}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          ← Scan lagi
        </button>
        <h1 className="text-xl font-bold text-gray-800">Hasil Analisis</h1>
      </div>

      <RecipeList result={result} />

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          📸 Scan Foto Lain
        </button>
      </div>
    </main>
  );
}
