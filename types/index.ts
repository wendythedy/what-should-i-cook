export interface Ingredient {
  name: string;
  category: "vegetable" | "protein" | "dairy" | "grain" | "other";
  confidence: "high" | "medium" | "low";
}

export interface RecipeIngredient {
  name: string;
  fromPhoto: boolean;
  amount: string;
}

export interface Recipe {
  name: string;
  cookingTime: string;
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredient[];
  steps: string[];
  tip: string;
}

export interface AnalyzeResult {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

export interface UserAccess {
  canScan: boolean;
  isPaid: boolean;
  scanCount: number;
  freeLimit: number;
}
