import { GoogleGenAI, Type } from "@google/genai";

const getGeminiApiKey = () => {
  const viteApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (viteApiKey) return viteApiKey;

  const injectedApiKey = (process.env.API_KEY as string | undefined)?.trim();
  if (injectedApiKey) return injectedApiKey;

  return undefined;
};

const getAIClient = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const ensureAIClient = () => {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY (or GEMINI_API_KEY during build).');
  }
  return ai;
};

export const analyzeListingImage = async (base64Image: string, titleHint?: string) => {
  const ai = ensureAIClient();
  const prompt = `Analyze this image of a clothing item for sale on Vinted. ${titleHint ? `The item title is hinted as "${titleHint}".` : ''} 
  Provide accurate details for the following fields: Title (short and catchy), Description (appealing), Category Path (e.g., Women / Shoes / Trainers), Brand, Size, Color, Condition, Material, and estimated measurements in inches (Shoulder Width and Length).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            brand: { type: Type.STRING },
            size: { type: Type.STRING },
            color: { type: Type.STRING },
            condition: { type: Type.STRING },
            material: { type: Type.STRING },
            shoulderWidth: { type: Type.NUMBER },
            length: { type: Type.NUMBER },
            priceSuggestion: { type: Type.NUMBER }
          },
          required: ["title", "description", "category", "brand", "size", "color", "condition", "material", "priceSuggestion"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
};

export const getMarketTrends = async (region: string) => {
  const ai = ensureAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `What are the currently trending clothing brands and items on Vinted in ${region}? 
    List the top 5 trending brands and top 5 trending item categories. Include a brief reason why.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

  return { text, sources };
};

export const getDashboardTrendData = async (region: string = "UK") => {
  try {
    const ai = ensureAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a search and return numerical popularity scores for trending brands and a 6-month demand trajectory for Vinted in ${region}. Output MUST be valid JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  brand: { type: Type.STRING },
                  score: { type: Type.NUMBER, description: "Popularity index from 0 to 100" },
                  growth: { type: Type.NUMBER, description: "Percentage growth month over month" }
                },
                required: ["brand", "score", "growth"]
              }
            },
            popularityHistory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  popularity: { type: Type.NUMBER }
                },
                required: ["month", "popularity"]
              }
            },
            marketSummary: { type: Type.STRING },
            nextHotCategory: { type: Type.STRING }
          },
          required: ["brandTrends", "popularityHistory", "marketSummary", "nextHotCategory"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];
    return { ...data, sources };
  } catch (error) {
    console.warn("Gemini dashboard trend unavailable, using fallback data:", error);
    return {
      brandTrends: [
        { brand: 'Stussy', score: 92, growth: 12 },
        { brand: 'Nike', score: 88, growth: 4 },
        { brand: 'Carhartt', score: 85, growth: 18 },
        { brand: 'Arc\'teryx', score: 78, growth: 22 },
        { brand: 'Zara', score: 72, growth: -2 },
        { brand: 'Adidas', score: 68, growth: 8 }
      ],
      popularityHistory: [
        { month: 'Oct', popularity: 65 },
        { month: 'Nov', popularity: 72 },
        { month: 'Dec', popularity: 85 },
        { month: 'Jan', popularity: 82 },
        { month: 'Feb', popularity: 89 },
        { month: 'Mar', popularity: 94 }
      ],
      marketSummary: "High demand for workwear and tech-wear brands. Stussy is peaking due to seasonal drops.",
      nextHotCategory: "Vintage Leather Jackets",
      sources: []
    };
  }
};
