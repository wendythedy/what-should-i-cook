"use client";
import { useMemo } from "react";
import type { Recipe } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  vegetable: "🥦 Sayuran",
  protein: "🥩 Protein",
  dairy: "🥛 Susu & Telur",
  grain: "🌾 Bahan Pokok",
  spice: "🧂 Bumbu & Rempah",
  other: "🛒 Lainnya",
};

interface Props {
  recipes: Recipe[];
  onClose: () => void;
}

export default function GroceryList({ recipes, onClose }: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const cat = ing.category ?? "other";
        if (!map[cat]) map[cat] = new Set();
        map[cat].add(`${ing.amount} ${ing.name}`.trim());
      });
    });
    return map;
  }, [recipes]);

  function handleCopy() {
    const text = Object.entries(grouped)
      .map(([cat, items]) => `${CATEGORY_LABEL[cat] ?? cat}\n${[...items].map((i) => `- ${i}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🛒 Grocery List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Gabungan semua bahan dari {recipes.length} resep di atas
        </p>

        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {CATEGORY_LABEL[cat] ?? cat}
              </h3>
              <ul className="space-y-1">
                {[...items].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded accent-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="w-full mt-5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors"
        >
          📋 Copy ke clipboard
        </button>
      </div>
    </div>
  );
}
