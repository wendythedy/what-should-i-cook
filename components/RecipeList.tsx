import type { AnalyzeResult } from "@/types";
import RecipeCard from "./RecipeCard";

export default function RecipeList({ result }: { result: AnalyzeResult }) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-4">
        <h2 className="font-semibold text-green-800 mb-2">🥦 Bahan yang terdeteksi:</h2>
        <div className="flex flex-wrap gap-2">
          {result.ingredients.map((ing, i) => (
            <span
              key={i}
              className={[
                "px-3 py-1 rounded-full text-sm font-medium",
                ing.confidence === "high"
                  ? "bg-green-100 text-green-700"
                  : ing.confidence === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-500",
              ].join(" ")}
            >
              {ing.name}
            </span>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800">🍳 Rekomendasi Resep</h2>

      {result.recipes.map((recipe, i) => (
        <RecipeCard key={i} recipe={recipe} index={i} />
      ))}
    </div>
  );
}
