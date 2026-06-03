export const SYSTEM_PROMPT = `You are a professional chef assistant. Analyze ingredient photos and suggest practical recipes. Return ONLY valid JSON with no markdown or extra text.`;

export const USER_PROMPT = `Analyze this photo and return a JSON object with EXACTLY this structure:
{
  "ingredients": [
    { "name": "string", "category": "vegetable|protein|dairy|grain|other", "confidence": "high|medium|low" }
  ],
  "recipes": [
    {
      "name": "string",
      "cookingTime": "string",
      "difficulty": "easy|medium|hard",
      "ingredients": [
        { "name": "string", "fromPhoto": true, "amount": "string" }
      ],
      "steps": ["step 1...", "step 2..."],
      "tip": "string"
    }
  ]
}

Rules:
- Identify ALL visible ingredients
- Suggest exactly 3 recipes
- Prioritize recipes under 30 minutes
- Use as many photo ingredients as possible
- Max 6 steps per recipe
- Respond in Bahasa Indonesia`;
