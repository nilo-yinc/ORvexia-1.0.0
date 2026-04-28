const { GoogleGenerativeAI } = require("@google/generative-ai");
require('../config/loadEnv');

// Models to try in order of preference
const MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemma-3-4b-it",
];

class AIService {
  static async generate(prompt, retries = 3) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[AIService] GEMINI_API_KEY missing");
      return "AI_UNAVAILABLE";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = process.env.GEMINI_MODEL 
      ? [process.env.GEMINI_MODEL, ...MODEL_FALLBACKS] 
      : MODEL_FALLBACKS;

    for (const modelName of models) {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          console.log(`[AIService] Trying ${modelName} (attempt ${attempt + 1}/${retries})`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          console.log(`[AIService] Success with ${modelName}`);
          return text;
        } catch (error) {
          const status = error?.status || error?.message || '';
          console.warn(`[AIService] ${modelName} attempt ${attempt + 1} failed: ${status}`);
          
          // If rate limited, wait before retry
          if (String(status).includes('429') || String(status).includes('503')) {
            const waitMs = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`[AIService] Waiting ${waitMs}ms before retry...`);
            await new Promise(r => setTimeout(r, waitMs));
            continue;
          }
          
          // For 404 (model not found), skip to next model immediately
          if (String(status).includes('404')) {
            break;
          }
          
          // For other errors, retry
          if (attempt < retries - 1) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    }

    return "AI_ERROR: All models exhausted. Please try again in a moment.";
  }

  /**
   * Specifically for Table AI Fields
   * Substitutes row data into prompt before generation
   */
  static async generateForRow(promptTemplate, rowData) {
    let prompt = promptTemplate;
    // Replace {{ColumnName}} with rowData[ColumnName]
    Object.keys(rowData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, rowData[key]);
    });

    return await this.generate(prompt);
  }
}

module.exports = AIService;
