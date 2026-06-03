export interface Ingredient {
  name: string;
  category: "vegetable" | "protein" | "dairy" | "grain" | "other";
  confidence: "high" | "medium" | "low";
}

export interface RecipeIngredient {
  name: string;
  fromPhoto: boolean;
  amount: string;
  category?: string;
}

export interface Recipe {
  name: string;
  cuisine?: string;
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
  paidBalance: number;
  scansRemaining: number;
  freeLimit: number;
  scansPerPurchase: number;
}

export interface HistoryItem {
  id: string;
  user_email: string;
  image_url: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
  cuisine_filter: string;
  created_at: string;
}
