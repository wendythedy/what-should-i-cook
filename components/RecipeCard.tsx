import type { Recipe } from "@/types";

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};
const DIFFICULTY_LABEL = { easy: "Mudah", medium: "Sedang", hard: "Sulit" };

export default function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-orange-500 font-bold text-sm">Resep #{index + 1}</span>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{recipe.name}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${DIFFICULTY_STYLES[recipe.difficulty]}`}>
          {DIFFICULTY_LABEL[recipe.difficulty]}
        </span>
      </div>

      <div className="flex gap-4 text-sm text-gray-500 mb-4">
        <span>⏱️ {recipe.cookingTime}</span>
        <span>🥄 {recipe.ingredients.length} bahan</span>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Bahan-bahan:</h4>
        <ul className="space-y-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span>{ing.fromPhoto ? "✅" : "🏪"}</span>
              <span className={ing.fromPhoto ? "text-gray-800" : "text-gray-400"}>
                {ing.amount} {ing.name}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-2">✅ dari foto &nbsp;·&nbsp; 🏪 bumbu dapur biasa</p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Cara Memasak:</h4>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-gray-600">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-amber-50 rounded-xl p-3">
        <p className="text-sm text-amber-700">
          <span className="font-semibold">💡 Tips:</span> {recipe.tip}
        </p>
      </div>
    </div>
  );
}
